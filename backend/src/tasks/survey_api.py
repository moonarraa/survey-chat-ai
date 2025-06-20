from fastapi import APIRouter, Depends, Body, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from src.auth.dependencies import get_current_user
from src.database import get_async_db
from src.tasks.models import SurveyCreate, SurveyOut, User
from src.tasks.crud import SurveyDAO
from src.tasks.schema import Survey, SurveyAnswer
from src.assistant.openai_assistant import ai_generate_followup_question, ai_generate_questions_for_topic, ai_is_meaningful_answer, ai_generate_advanced_questions_for_context
import json
from pydantic import BaseModel
from typing import Any
from sqlalchemy import select

router = APIRouter(tags=["surveys"])

class PublicSurveyOut(BaseModel):
    topic: str
    questions: list[Any]

class PublicSurveyAnswerIn(BaseModel):
    answers: list[str]
    respondent_id: str | None = None  # Optional, for future

class PublicSurveyAnswerOut(BaseModel):
    ok: bool
    message: str

class GenerateQuestionsIn(BaseModel):
    topic: str
    n: int = 5

class GenerateQuestionsOut(BaseModel):
    questions: list[str]

class GenerateQuestionsAdvancedIn(BaseModel):
    context: str
    n: int = 5

class GenerateQuestionsAdvancedOut(BaseModel):
    questions: list[dict]

@router.post("/", response_model=SurveyOut)
async def create_survey(
    survey: SurveyCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    # Check if user already has an active survey
    existing_surveys = await SurveyDAO.get_surveys_by_user(current_user.id, db)
    active_surveys = [s for s in existing_surveys if not s.archived]
    if active_surveys:
        raise HTTPException(
            status_code=400,
            detail="У вас уже есть активный опрос. Пожалуйста, архивируйте его перед созданием нового."
        )
    
    return await SurveyDAO.create_survey(current_user.id, survey.topic, survey.questions, db)

@router.get("/", response_model=list[SurveyOut])
async def list_surveys(
    archived: bool = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    query = Survey.__table__.select().where(Survey.user_id == current_user.id)
    if archived is not None:
        query = query.where(Survey.archived == archived)
    result = await db.execute(query)
    surveys = result.fetchall()
    return [
        SurveyOut(
            id=s.id,
            topic=s.topic,
            questions=json.loads(s.questions),
            created_at=s.created_at,
            public_id=s.public_id,
            archived=s.archived,
        ) for s in [row._mapping for row in surveys]
    ]

@router.delete("/{survey_id}")
async def delete_survey(
    survey_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    survey = await db.get(Survey, survey_id)
    if not survey or survey.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Survey not found")
    await db.delete(survey)
    await db.commit()
    return {"ok": True}

@router.get("/{survey_id}", response_model=SurveyOut)
async def get_survey(
    survey_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    survey = await db.get(Survey, survey_id)
    if not survey or survey.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Survey not found")
    return SurveyOut(
        id=survey.id,
        topic=survey.topic,
        questions=json.loads(survey.questions),
        created_at=survey.created_at,
        public_id=survey.public_id,
        archived=survey.archived,
    )

@router.get("/s/{public_id}", response_model=PublicSurveyOut)
async def get_public_survey(
    public_id: str,
    db: AsyncSession = Depends(get_async_db)
):
    result = await db.execute(
        Survey.__table__.select().where(Survey.public_id == public_id)
    )
    survey = result.first()
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    survey = survey._mapping  # SQLAlchemy 2.x returns Row, get dict-like
    return PublicSurveyOut(
        topic=survey["topic"],
        questions=json.loads(survey["questions"])
    )

@router.post("/s/{public_id}/answer", response_model=PublicSurveyAnswerOut)
async def submit_public_survey_answer(
    public_id: str,
    data: PublicSurveyAnswerIn = Body(...),
    request: Request = None,
    db: AsyncSession = Depends(get_async_db)
):
    # Получаем опрос
    result = await db.execute(Survey.__table__.select().where(Survey.public_id == public_id))
    survey = result.first()
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    survey = survey._mapping
    
    # Проверяем, не архивирован ли опрос
    if survey["archived"]:
        raise HTTPException(
            status_code=403,
            detail="Этот опрос находится в архиве и больше не принимает ответы."
        )
    
    # Save answer to DB
    db_answer = SurveyAnswer(
        survey_id=survey["id"],
        public_id=public_id,
        answers=json.dumps(data.answers),
        respondent_id=data.respondent_id,
        ip=request.client.host if request else None
    )
    db.add(db_answer)
    await db.commit()
    return PublicSurveyAnswerOut(ok=True, message="Ответ успешно сохранён!")

@router.post("/s/{public_id}/next-question")
async def get_next_ai_question(
    public_id: str,
    data: dict = Body(...),
    db: AsyncSession = Depends(get_async_db)
):
    result = await db.execute(Survey.__table__.select().where(Survey.public_id == public_id))
    survey = result.first()
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    survey = survey._mapping
    topic = survey["topic"]
    history = data.get("history", [])
    last_answer = data.get("last_answer", "")
    last_question = history[-1]["question"] if history else ""
    # Проверяем осмысленность ответа
    if not ai_is_meaningful_answer(last_answer, last_question):
        # Генерируем просьбу уточнить (можно отдельной функцией, но можно и простым шаблоном)
        return {
            "question": f"Пожалуйста, уточните ваш ответ на предыдущий вопрос. Ваш ответ: \"{last_answer}\". Желательно, чтобы ваш ответ был более развернутым и содержательным."
        }
    # Если ответ осмысленный — обычный follow-up
    question = ai_generate_followup_question(topic, history, last_answer)
    return {"question": question}

@router.post("/generate-questions", response_model=GenerateQuestionsOut)
async def generate_questions(data: GenerateQuestionsIn = Body(...)):
    questions = ai_generate_questions_for_topic(data.topic, n=min(max(data.n, 3), 5))
    return GenerateQuestionsOut(questions=questions)

@router.post("/generate-questions-advanced", response_model=GenerateQuestionsAdvancedOut)
async def generate_questions_advanced(data: GenerateQuestionsAdvancedIn = Body(...)):
    questions = ai_generate_advanced_questions_for_context(data.context, n=min(max(data.n, 3), 8))
    return GenerateQuestionsAdvancedOut(questions=questions)

@router.put("/{survey_id}", response_model=SurveyOut)
async def update_survey(
    survey_id: int,
    data: dict = Body(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    survey = await db.get(Survey, survey_id)
    if not survey or survey.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Survey not found")
    # Обновляем вопросы
    questions = data.get("questions")
    if questions is not None:
        survey.questions = json.dumps(questions)
    await db.commit()
    await db.refresh(survey)
    return SurveyOut(
        id=survey.id,
        topic=survey.topic,
        questions=json.loads(survey.questions),
        created_at=survey.created_at,
        public_id=survey.public_id,
        archived=survey.archived,
    )

@router.post("/{survey_id}/archive")
async def archive_survey(
    survey_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    survey = await db.get(Survey, survey_id)
    if not survey or survey.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Survey not found")
    survey.archived = True
    await db.commit()
    return {"ok": True}

@router.post("/{survey_id}/restore")
async def restore_survey(
    survey_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    survey = await db.get(Survey, survey_id)
    if not survey or survey.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    # Check if user already has an active survey
    existing_surveys = await SurveyDAO.get_surveys_by_user(current_user.id, db)
    active_surveys = [s for s in existing_surveys if not s.archived and s.id != survey_id]
    if active_surveys:
        raise HTTPException(
            status_code=400,
            detail="У вас уже есть активный опрос. Архивируйте его перед восстановлением другого."
        )
    
    survey.archived = False
    await db.commit()
    return {"ok": True}

@router.get("/s/{public_id}/answers")
async def get_public_survey_answers(public_id: str, db: AsyncSession = Depends(get_async_db)):
    result = await db.execute(select(SurveyAnswer).where(SurveyAnswer.public_id == public_id))
    answers = result.scalars().all()
    return [
        {
            "answers": json.loads(a.answers),
            "respondent_id": a.respondent_id,
            "ip": a.ip,
            "created_at": a.created_at.isoformat() if a.created_at else None
        }
        for a in answers
    ]

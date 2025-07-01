from fastapi import APIRouter, Depends, Body, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from src.auth.dependencies import get_current_user
from src.database import get_async_db
from src.tasks.models import SurveyCreate, SurveyOut, User
from src.tasks.crud import SurveyDAO
from src.tasks.schema import Survey, SurveyAnswer
from src.assistant.openai_assistant import (
    ai_generate_followup_question, 
    ai_generate_questions_for_topic, 
    ai_is_meaningful_answer, 
    ai_generate_advanced_questions_for_context,
    ai_is_meaningful_context
)
import json
from pydantic import BaseModel
from typing import Any
from sqlalchemy import select, func, and_
from collections import Counter
from src.leaderboard.api import broadcast_leaderboard_update

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

class ValidateContextIn(BaseModel):
    context: str

class ValidateContextOut(BaseModel):
    is_valid: bool
    reason: str | None = None

class SurveyAnalytics(BaseModel):
    total_responses: int
    question_analytics: dict[str, Any]
    first_response_date: str | None = None
    last_response_date: str | None = None
    unique_respondents: int | None = None
    avg_time_between_responses: float | None = None
    response_rate: float | None = None
    response_times: list[str] = []
    popular_day: str | None = None
    popular_hour: str | None = None

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
    # Subquery to count answers for each survey
    answers_count_subquery = (
        select(
            SurveyAnswer.survey_id,
            func.count(SurveyAnswer.id).label("answers_count")
        )
        .group_by(SurveyAnswer.survey_id)
        .subquery()
    )

    # Main query to select surveys and join with the answer count
    query = (
        select(
            Survey.__table__,
            answers_count_subquery.c.answers_count
        )
        .outerjoin(answers_count_subquery, Survey.id == answers_count_subquery.c.survey_id)
        .where(Survey.user_id == current_user.id)
    )
    
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
            answers_count=s.answers_count or 0,
        ) for s in surveys
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
    # Удаляем все связанные ответы
    await db.execute(
        SurveyAnswer.__table__.delete().where(SurveyAnswer.survey_id == survey_id)
    )
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
    
    # Check if this IP has already answered
    if request and request.client:
        existing_answer = await db.execute(
            select(SurveyAnswer).where(
                and_(
                    SurveyAnswer.survey_id == survey["id"],
                    SurveyAnswer.ip == request.client.host
                )
            )
        )
        if existing_answer.first():
            raise HTTPException(
                status_code=403,
                detail="You have already submitted a response for this survey from this IP address."
            )

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

    # If it's a template survey, broadcast the leaderboard update
    if survey["is_template_survey"]:
        await broadcast_leaderboard_update(db)

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

@router.post("/archive-all-active", tags=["temporary"])
async def archive_all_active_surveys(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Temporary endpoint to find and archive all active surveys for the current user.
    """
    try:
        query = select(Survey).where(Survey.user_id == current_user.id).where(Survey.archived == False)
        result = await db.execute(query)
        surveys_to_archive = result.scalars().all()

        if not surveys_to_archive:
            return {"message": "No active surveys found to archive."}

        for survey in surveys_to_archive:
            survey.archived = True
        
        await db.commit()

        return {"message": f"Successfully archived {len(surveys_to_archive)} active survey(s)."}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

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

@router.get("/{survey_id}/analytics", response_model=SurveyAnalytics)
async def get_survey_analytics(
    survey_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    survey = await db.get(Survey, survey_id)
    if not survey or survey.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Survey not found")

    # Fetch all answers for the survey
    answers_result = await db.execute(
        select(SurveyAnswer).where(SurveyAnswer.survey_id == survey_id)
    )
    answers = answers_result.scalars().all()

    total_responses = len(answers)
    question_analytics = {}

    # Дополнительные метрики
    if answers:
        sorted_answers = sorted(answers, key=lambda a: a.created_at)
        first_response_date = sorted_answers[0].created_at.isoformat() if sorted_answers[0].created_at else None
        last_response_date = sorted_answers[-1].created_at.isoformat() if sorted_answers[-1].created_at else None
        respondent_ids = [a.respondent_id for a in answers if a.respondent_id]
        unique_respondents = len(set(respondent_ids)) if respondent_ids else None
        # Среднее время между ответами (в минутах)
        if len(sorted_answers) > 1:
            times = [a.created_at for a in sorted_answers if a.created_at]
            deltas = [(t2 - t1).total_seconds() / 60 for t1, t2 in zip(times, times[1:])]
            avg_time_between_responses = round(sum(deltas) / len(deltas), 2) if deltas else None
        else:
            avg_time_between_responses = None
        # Завершаемость (response_rate) — если нет незавершённых, считаем 100%
        response_rate = 100.0
        # Массив дат ответов
        response_times = [a.created_at.isoformat() for a in sorted_answers if a.created_at]
        # Популярный день недели
        days = [a.created_at.strftime('%A') for a in sorted_answers if a.created_at]
        popular_day = Counter(days).most_common(1)[0][0] if days else None
        # Популярный час
        hours = [a.created_at.hour for a in sorted_answers if a.created_at]
        if hours:
            hour = Counter(hours).most_common(1)[0][0]
            popular_hour = f"{hour:02d}:00 - {hour:02d}:59"
        else:
            popular_hour = None
    else:
        first_response_date = None
        last_response_date = None
        unique_respondents = None
        avg_time_between_responses = None
        response_rate = None
        response_times = []
        popular_day = None
        popular_hour = None

    questions = json.loads(survey.questions)
    # Собираем ответы по вопросам (answers: list[str] по индексу)
    all_answers = [json.loads(a.answers) for a in answers]
    for i, q in enumerate(questions):
        q_text = q.get('text', f'Question {i+1}')
        q_type = q.get('type', 'unknown')
        # Собираем все ответы на этот вопрос (по индексу)
        q_answers = [a[i] if len(a) > i else None for a in all_answers]
        if q_type == 'rating':
            # Считаем распределение, среднее, медиану, моду
            dist = {}
            total = 0
            count = 0
            values = []
            for ans in q_answers:
                try:
                    val = int(ans)
                    dist[str(val)] = dist.get(str(val), 0) + 1
                    total += val
                    count += 1
                    values.append(val)
                except (TypeError, ValueError):
                    continue
            avg = round(total / count, 2) if count else 0
            median = 0
            mode = None
            if values:
                sorted_vals = sorted(values)
                n = len(sorted_vals)
                if n % 2 == 1:
                    median = sorted_vals[n // 2]
                else:
                    median = (sorted_vals[n // 2 - 1] + sorted_vals[n // 2]) / 2
                # Мода
                counter = Counter(values)
                mode = counter.most_common(1)[0][0] if counter else None
            question_analytics[q_text] = {
                "type": "rating",
                "average": avg,
                "median": median,
                "mode": mode,
                "distribution": dist
            }
        elif q_type == 'multiple_choice':
            # Считаем количество по каждому варианту
            opts = q.get('options', [])
            opt_counts = {opt: 0 for opt in opts}
            for ans in q_answers:
                if ans in opt_counts:
                    opt_counts[ans] += 1
            question_analytics[q_text] = {
                "type": "multiple_choice",
                "answers": opt_counts
            }
        elif q_type in ('open_ended', 'long_text'):
            # Собираем все текстовые ответы
            texts = [ans for ans in q_answers if ans]
            question_analytics[q_text] = {
                "type": "text",
                "answers": texts
            }
        elif q_type == 'ranking':
            # Для ranking: средний ранг по каждому элементу
            items = q.get('items', [])
            rankings = [ans for ans in q_answers if isinstance(ans, list) and len(ans) == len(items)]
            # Для каждого item считаем средний ранг (позицию)
            item_positions = {item: [] for item in items}
            for ranking in rankings:
                for pos, item in enumerate(ranking):
                    if item in item_positions:
                        item_positions[item].append(pos + 1)  # ранг с 1
            avg_ranks = {item: round(sum(pos_list)/len(pos_list), 2) if pos_list else None for item, pos_list in item_positions.items()}
            question_analytics[q_text] = {
                "type": "ranking",
                "answers": rankings,
                "items": items,
                "average_ranks": avg_ranks
            }
        elif q_type == 'image_choice':
            # Для image_choice: считаем по label или url
            images = q.get('images', [])
            img_labels = [img['label'] if isinstance(img, dict) and 'label' in img else str(img) for img in images]
            img_counts = {label: 0 for label in img_labels}
            for ans in q_answers:
                if ans in img_counts:
                    img_counts[ans] += 1
            question_analytics[q_text] = {
                "type": "image_choice",
                "answers": img_counts
            }
        else:
            # Прочие типы — просто список ответов
            question_analytics[q_text] = {
                "type": q_type,
                "answers": [ans for ans in q_answers if ans]
            }

    return SurveyAnalytics(
        total_responses=total_responses,
        question_analytics=question_analytics,
        first_response_date=first_response_date,
        last_response_date=last_response_date,
        unique_respondents=unique_respondents,
        avg_time_between_responses=avg_time_between_responses,
        response_rate=response_rate,
        response_times=response_times,
        popular_day=popular_day,
        popular_hour=popular_hour
    )

from fastapi import APIRouter, Depends, Body, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from src.auth.dependencies import get_current_user
from src.database import get_async_db
from src.tasks.models import SurveyCreate, SurveyOut, User
from src.tasks.crud import SurveyDAO
from src.tasks.schema import Survey
import json

router = APIRouter(tags=["surveys"])

@router.post("/", response_model=SurveyOut)
async def create_survey(
    survey: SurveyCreate = Body(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    db_survey = await SurveyDAO.create_survey(
        user_id=current_user.id,
        topic=survey.topic,
        questions=survey.questions,
        db=db
    )
    # Convert questions from JSON string to list for output
    return SurveyOut(
        id=db_survey.id,
        topic=db_survey.topic,
        questions=json.loads(db_survey.questions),
        created_at=str(db_survey.created_at)
    )

@router.get("/", response_model=list[SurveyOut])
async def list_surveys(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    surveys = await SurveyDAO.get_surveys_by_user(current_user.id, db)
    return [
        SurveyOut(
            id=s.id,
            topic=s.topic,
            questions=json.loads(s.questions),
            created_at=str(s.created_at)
        )
        for s in surveys
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
        created_at=str(survey.created_at)
    )

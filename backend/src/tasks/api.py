from fastapi import APIRouter, Body, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
import uuid
from src.assistant.openai_assistant import (
    ai_generate_first_question,
    ai_generate_followup_question,
    ai_analyze_answers
)

from src.auth.dependencies import get_current_user
from src.auth.exceptions import (InvalidCredentialsException,
                             UserAlreadyExistsException, raise_http_exception)
from src.tasks.models import Token, User, UserCredentials
from src.tasks.service import AuthService
from src.database import get_async_db
from src.tasks.crud import UserDAO

router = APIRouter(prefix="/auth")

# Simple in-memory session store for demo
sessions = {}

class StartRequest(BaseModel):
    topic: str

class StartResponse(BaseModel):
    sessionId: str
    question: str

class AnswerRequest(BaseModel):
    sessionId: str
    answer: str

class AnswerResponse(BaseModel):
    question: str = None
    summary: str = None

class UserProfileUpdate(BaseModel):
    # company: str
    # role: str
    pass

@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_async_db)
):
    try:
        return await AuthService.authenticate_user(
            email=form_data.username,
            password=form_data.password,
            db=db
        )
    except InvalidCredentialsException as e:
        raise_http_exception(e)


@router.post("/register", response_model=Token)
async def register_user(
    credentials: UserCredentials = Body(...),
    db: AsyncSession = Depends(get_async_db)
):
    try:
        return await AuthService.register_user(credentials, db)
    except UserAlreadyExistsException as e:
        raise_http_exception(e)


@router.get("/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/api/survey/start", response_model=StartResponse)
async def start_survey(req: StartRequest):
    session_id = str(uuid.uuid4())
    question = ai_generate_first_question(req.topic)
    sessions[session_id] = {
        "topic": req.topic,
        "history": [],
        "current_question": question,
        "count": 1
    }
    return {"sessionId": session_id, "question": question}

@router.post("/api/survey/answer", response_model=AnswerResponse)
async def answer_survey(req: AnswerRequest):
    session = sessions.get(req.sessionId)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    session["history"].append({"question": session["current_question"], "answer": req.answer})
    session["count"] += 1

    # После 5 вопросов — анализ и завершение
    if session["count"] > 5:
        summary = ai_analyze_answers(session["topic"], session["history"])
        return {"summary": summary}

    # Генерируем follow-up вопрос с учётом истории и последнего ответа
    next_question = ai_generate_followup_question(
        session["topic"], session["history"], req.answer
    )
    session["current_question"] = next_question
    return {"question": next_question}

@router.put("/me", response_model=User)
async def update_profile(
    profile: UserProfileUpdate = Body(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    db_user = await UserDAO.get_user_by_email(current_user.email, db)
    # db_user.company = profile.company
    # db_user.role = profile.role
    await db.commit()
    await db.refresh(db_user)
    return db_user
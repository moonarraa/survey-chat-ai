from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy import text
from sqlalchemy.exc import OperationalError
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.middleware.sessions import SessionMiddleware
import os
from src.config import settings

from fastapi.middleware.cors import CORSMiddleware

from src.tasks.api import router as tasks_router
from src.database import get_async_db
from src.auth.oauth import router as oauth_router
from src.tasks.survey_api import router as survey_router

app = FastAPI()

# Список разрешенных origins
origins = [
    "http://localhost:3000",  # Для локальной разработки
    "http://localhost:5173",  # Для Vite dev server
    "https://survey-chat-ai.vercel.app",  # Ваш домен на Vercel (замените на актуальный)
    "https://survey-chat-ai*.vercel.app"  # Для preview deployments
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.add_middleware(
    SessionMiddleware,
    secret_key=settings.secret_key,
    https_only=getattr(settings, 'environment', 'development') == "production"  # Более безопасный способ получения атрибута
)

app.include_router(tasks_router, tags=["tasks"])
app.include_router(oauth_router, prefix="/auth")
app.include_router(survey_router, prefix="/surveys")

@app.get("/")
def read_root():
    return {
        "message": "SurveyChat API is running",
        "version": "1.0.0",
        "environment": settings.environment
    }

@app.get("/health")
async def check_health(db: AsyncSession = Depends(get_async_db)):
    try:
        await db.execute(text("SELECT 1"))
    except OperationalError:
        raise HTTPException(
            status_code=500, detail="Database connection failed"
        )

    return {"status": "ok", "database": "connected"}
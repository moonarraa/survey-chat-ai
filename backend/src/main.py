from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy import text
from sqlalchemy.exc import OperationalError
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.middleware.sessions import SessionMiddleware
import os
import logging
from src.config import settings
from src.database import get_async_db, AsyncSessionLocal

from fastapi.middleware.cors import CORSMiddleware

from src.tasks.api import router as tasks_router
from src.database import get_async_db
from src.auth.api import router as auth_router
from src.tasks.survey_api import router as survey_router
from src.assistant.template_survey import router as template_survey_router
from src.leaderboard.api import router as leaderboard_router

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Список разрешенных origins
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:8000",
    "https://survey-ai.live",
    "https://www.survey-ai.live"
]

@app.on_event("startup")
async def startup_event():
    logger.info("Starting up application...")
    logger.info(f"Environment: {getattr(settings, 'environment', 'development')}")
    
    # Логируем URL базы данных (без чувствительных данных)
    db_url = settings.async_database_url
    if db_url:
        parsed_url = db_url.split('@')
        if len(parsed_url) > 1:
            logger.info(f"Database host: {parsed_url[1].split('/')[0]}")
        else:
            logger.info("Database URL is not in expected format")
    else:
        logger.error("Database URL is not configured")
        
    try:
        logger.info("Attempting database connection...")
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
            logger.info("Database connection successful")
    except Exception as e:
        logger.error(f"Database connection failed: {str(e)}")
        # Don't raise here to allow the application to start even with DB issues

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
    https_only=getattr(settings, 'environment', 'development') == "production"
)

# Добавляем middleware для логирования запросов
@app.middleware("http")
async def log_requests(request, call_next):
    logger.info(f"Request path: {request.url.path}")
    try:
        response = await call_next(request)
        logger.info(f"Response status code: {response.status_code}")
        return response
    except Exception as e:
        logger.error(f"Request failed: {str(e)}")
        raise

app.include_router(tasks_router, tags=["tasks"])
app.include_router(auth_router, prefix="/auth")
app.include_router(survey_router, prefix="/api/surveys")
app.include_router(template_survey_router, prefix="/surveys", tags=["surveys"])
app.include_router(leaderboard_router, prefix="/leaderboard", tags=["leaderboard"])

@app.get("/")
def read_root():
    logger.info("Root endpoint called")
    return {
        "message": "Survey AI API is running",
        "version": "1.0.0",
        "environment": getattr(settings, 'environment', 'development')
    }

@app.get("/health")
async def check_health(db: AsyncSession = Depends(get_async_db)):
    logger.info("Health check endpoint called")
    try:
        await db.execute(text("SELECT 1"))
        logger.info("Health check successful")
        return {
            "status": "ok",
            "database": "connected",
            "environment": getattr(settings, 'environment', 'development')
        }
    except OperationalError as e:
        logger.error(f"Database health check failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Database connection failed: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Health check failed: {str(e)}"
        )
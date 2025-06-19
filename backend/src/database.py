from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.exc import SQLAlchemyError
import logging
import os

from src.config import settings

logger = logging.getLogger(__name__)

# Создаем движки с отключенным pool_pre_ping для избежания ошибок при старте
async_engine = create_async_engine(
    settings.async_database_url,
    pool_pre_ping=False,
    pool_size=5,
    max_overflow=10,
    echo=False
)

AsyncSessionLocal = sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False
)

sync_engine = create_engine(
    settings.sync_database_url,
    pool_pre_ping=False,
    pool_size=5,
    max_overflow=10,
    echo=False
)

SyncSessionLocal = sessionmaker(
    bind=sync_engine,
    autocommit=False,
    autoflush=False
)

Base = declarative_base()

async def get_async_db():
    session = AsyncSessionLocal()
    try:
        yield session
    except SQLAlchemyError as e:
        logger.error(f"Database error occurred: {str(e)}")
        await session.rollback()
        raise
    finally:
        await session.close()

def get_sync_db():
    db = SyncSessionLocal()
    try:
        yield db
    except SQLAlchemyError as e:
        logger.error(f"Database error occurred: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()
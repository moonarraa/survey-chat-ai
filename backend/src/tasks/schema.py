from datetime import datetime
import secrets

from sqlalchemy import Column, DateTime, Integer, String, ForeignKey, Text, Boolean

from src.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    age = Column(Integer)
    name = Column(String)
    company = Column(String)
    role = Column(String)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now)


class Survey(Base):
    __tablename__ = "surveys"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    topic = Column(String, nullable=False)
    questions = Column(Text, nullable=False)  # Store as JSON string
    created_at = Column(DateTime, default=datetime.now)
    public_id = Column(String, unique=True, index=True, nullable=False, default=lambda: secrets.token_urlsafe(6))
    archived = Column(Boolean, default=False, nullable=False)


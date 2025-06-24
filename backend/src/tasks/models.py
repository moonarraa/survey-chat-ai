from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str


class User(BaseModel):
    id: int
    email: EmailStr



class Token(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str


class TokenData(BaseModel):
    email: str | None = None


class UserCredentials(BaseModel):
    email: EmailStr
    password: str
    name: str
    company: str
    role: str


class SurveyCreate(BaseModel):
    topic: str
    questions: list[Any]


class SurveyOut(BaseModel):
    id: int
    topic: str
    questions: List[Any]
    created_at: datetime
    public_id: str
    archived: bool
    answers_count: int | None = None

    class Config:
        from_attributes = True

 
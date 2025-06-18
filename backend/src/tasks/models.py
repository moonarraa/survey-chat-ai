from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any

class UserCreate(BaseModel):
    email: EmailStr
    password: str


class User(BaseModel):
    id: int
    email: EmailStr

    class Config:
        orm_mode = True


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
    created_at: str
    public_id: str
    archived: bool

    class Config:
        orm_mode = True

from pydantic import BaseModel, EmailStr
from typing import Optional, List

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
    questions: List[str]


class SurveyOut(BaseModel):
    id: int
    topic: str
    questions: List[str]
    created_at: str

    class Config:
        orm_mode = True

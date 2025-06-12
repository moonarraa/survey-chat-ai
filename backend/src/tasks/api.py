from fastapi import APIRouter, Body, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from auth.dependencies import get_current_user
from auth.execptions import (InvalidCredentialsException,
                             UserAlreadyExistsException, raise_http_exception)
from backend.src.tasks.models import Token, User, UserCredentials
from backend.src.tasks.service import AuthService
from database import get_async_db

router = APIRouter(prefix="/auth")


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
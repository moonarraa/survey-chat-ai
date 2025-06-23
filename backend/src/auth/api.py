from fastapi import APIRouter, Body, Depends, HTTPException, Query
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from auth.dependencies import get_current_user
from auth.exceptions import (InvalidCredentialsException,
                             UserAlreadyExistsException, raise_http_exception)
from backend.src.tasks.models import Token, User, UserCredentials
from backend.src.tasks.service import AuthService
from database import get_async_db
from config import settings

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


@router.get("/users/count/simple", response_model=dict, summary="Get total user count with a simple API key")
async def get_users_count_simple(
    api_key: str = Query(..., description="A simple secret API key for admin access."),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Retrieves the total number of registered users using a simple, static API key.
    This provides a convenient way for an admin to check stats without a JWT token.
    """
    if api_key != settings.simple_api_key:
        raise HTTPException(
            status_code=403,
            detail="Invalid or missing API Key."
        )

    result = await db.execute(select(func.count(User.id)))
    total_users = result.scalar_one()

    return {"total_users": total_users}
from fastapi import APIRouter, Body, Depends, HTTPException, Query, Request
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from authlib.integrations.starlette_client import OAuth # type: ignore
import jwt
from datetime import datetime, timedelta
import uuid

from src.auth.dependencies import get_current_user
from src.auth.exceptions import (InvalidCredentialsException,
                             UserAlreadyExistsException, raise_http_exception)
from src.tasks.models import Token, User, UserCredentials
from src.tasks.service import AuthService
from src.database import get_async_db
from src.config import settings
from src.tasks.crud import UserDAO

router = APIRouter()

oauth = OAuth()
oauth.register(
    name='google',
    client_id=settings.google_client_id,
    client_secret=settings.google_client_secret,
    access_token_url='https://oauth2.googleapis.com/token',
    authorize_url='https://accounts.google.com/o/oauth2/v2/auth',
    api_base_url='https://www.googleapis.com/oauth2/v2/',
    client_kwargs={'scope': 'openid email profile'},
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
)


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


@router.get("/users/count", response_model=dict, summary="Get total user count")
async def get_users_count(
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieves the total number of registered users.
    This endpoint is protected and requires user authentication.
    """
    result = await db.execute(select(func.count(User.id)))
    total_users = result.scalar_one()
    return {"total_users": total_users}


@router.get('/login/google')
async def login_via_google(request: Request):
    redirect_uri = settings.google_redirect_url
    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get('/callback/google')
async def auth_via_google(request: Request):
    token = await oauth.google.authorize_access_token(request)
    print("TOKEN:", token)
    user_info = token.get("userinfo")
    if not user_info:
        # fallback to parsing id_token if userinfo is not present
        if "id_token" not in token:
            raise HTTPException(status_code=400, detail="No id_token in token response from Google")
        user_info = await oauth.google.parse_id_token(request, token)
    # Generate JWT for the user
    payload = {
        "sub": user_info["email"],
        "name": user_info.get("name"),
        "exp": datetime.utcnow() + timedelta(hours=1),
    }
    jwt_token = jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)
    frontend_url = f"http://localhost:5173/auth/callback/google?token={jwt_token}"
    return RedirectResponse(frontend_url)


@router.post("/users/generate-tg-link-code")
async def generate_tg_link_code(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    user = await UserDAO.get_user_by_id(current_user.id, db)
    code = uuid.uuid4().hex[:8]
    user.tg_link_code = code
    await db.commit()
    await db.refresh(user)
    return {"tg_link_code": code}

@router.post("/users/link-telegram")
async def link_telegram(
    tg_link_code: str = Body(...),
    tg_user_id: str = Body(...),
    db: AsyncSession = Depends(get_async_db)
):
    user = await db.execute(
        User.__table__.select().where(User.tg_link_code == tg_link_code)
    )
    user = user.first()
    if not user:
        raise HTTPException(status_code=404, detail="Invalid code")
    user = await UserDAO.get_user_by_id(user._mapping["id"], db)
    user.tg_user_id = tg_user_id
    user.tg_link_code = None
    await db.commit()
    await db.refresh(user)
    return {"ok": True}
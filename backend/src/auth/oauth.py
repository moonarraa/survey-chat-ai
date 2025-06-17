from fastapi import APIRouter, Request, Depends, HTTPException
from fastapi.responses import RedirectResponse
from authlib.integrations.starlette_client import OAuth
from src.config import settings  # Use settings for config values
import jwt
from datetime import datetime, timedelta

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

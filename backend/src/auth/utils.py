from datetime import datetime, timedelta

from jose import JWTError, jwt
from passlib.context import CryptContext
from src.auth.exceptions import InvalidTokenException, TokenExpiredException
from src.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


SECRET_KEY = settings.secret_key
ALGORITHM = settings.algorithm


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password."""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    """Create a JWT access token without expiration."""
    to_encode = data.copy()
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> str:
    """
    Decode JWT token and return email.
    Raises InvalidTokenException.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM], options={"verify_exp": False})
        email: str = payload.get("sub")
        if email is None:
            raise InvalidTokenException()
        return email
    except JWTError:
        raise InvalidTokenException()


def validate_token(token: str) -> bool:
    """Validate if token is valid without raising exceptions."""
    try:
        decode_access_token(token)
        return True
    except (InvalidTokenException, TokenExpiredException):
        return False
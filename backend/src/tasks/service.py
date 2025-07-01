"""
Auth service layer containing business logic for authentication.
"""
from datetime import timedelta
from typing import Dict

from sqlalchemy.ext.asyncio import AsyncSession

from src.tasks.crud import UserDAO
from src.auth.exceptions import (InvalidCredentialsException,
                             UserAlreadyExistsException)
from src.tasks.models import UserCredentials
from src.tasks.schema import User as DBUser
from src.auth.utils import create_access_token, get_password_hash, verify_password


class AuthService:
    @staticmethod
    async def authenticate_user(
        email: str,
        password: str,
        db: AsyncSession
    ) -> Dict[str, str]:
        user = await UserDAO.get_user_by_email(email, db)

        if not user or not verify_password(password, user.hashed_password):
            raise InvalidCredentialsException()

        access_token = create_access_token(
            data={"sub": user.email}
        )

        return {
            "access_token": access_token,
            "token_type": "bearer"
        }

    @staticmethod
    async def register_user(
        credentials: UserCredentials,
        db: AsyncSession
    ) -> Dict[str, str]:
        """
        Register a new user.
        Returns access token if successful.
        """
        # Check if user already exists
        if await UserDAO.user_exists(credentials.email, db):
            raise UserAlreadyExistsException(credentials.email)

        # Create new user
        hashed_password = get_password_hash(credentials.password)
        new_user = DBUser(
            email=credentials.email,
            hashed_password=hashed_password,
            name=credentials.name
        )

        created_user = await UserDAO.create_user(new_user, db)

        # Generate access token
        access_token = create_access_token(
            data={"sub": created_user.email}
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "refresh_token": ""  # or generate if you use refresh tokens
        }

    @staticmethod
    async def get_user_profile(user_id: int, db: AsyncSession) -> DBUser:
        """Get user profile by ID."""
        return await UserDAO.get_user_by_id_or_raise(user_id, db)

    @staticmethod
    async def update_user_password(
        user_id: int,
        new_password: str,
        db: AsyncSession
    ) -> bool:
        """Update user password."""
        user = await UserDAO.get_user_by_id_or_raise(user_id, db)
        user.hashed_password = get_password_hash(new_password)
        await UserDAO.update_user(user, db)
        return True

    @staticmethod
    async def delete_user_account(user_id: int, db: AsyncSession) -> bool:
        """Delete user account."""
        user = await UserDAO.get_user_by_id_or_raise(user_id, db)
        return await UserDAO.delete_user(user, db)
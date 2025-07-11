from typing import Optional
import json

from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from src.auth.exceptions import (DatabaseException, UserAlreadyExistsException,
                                 UserNotFoundException)
from src.tasks.schema import User, Survey
from src.tasks.models import SurveyOut


class UserDAO:

    @staticmethod
    async def get_user_by_email(
        email: str, db: AsyncSession
    ) -> Optional[User]:
        """Get user by email address."""
        try:
            query = select(User).where(User.email == email)
            result = await db.execute(query)
            return result.scalars().first()
        except Exception as e:
            raise DatabaseException(f"get_user_by_email: {str(e)}")

    @staticmethod
    async def get_user_by_id(user_id: int, db: AsyncSession) -> Optional[User]:
        """Get user by ID."""
        try:
            query = select(User).where(User.id == user_id)
            result = await db.execute(query)
            return result.scalars().first()
        except Exception as e:
            raise DatabaseException(f"get_user_by_id: {str(e)}")

    @staticmethod
    async def create_user(user: User, db: AsyncSession) -> User:
        """Create a new user."""
        try:
            db.add(user)
            await db.commit()
            await db.refresh(user)
            return user
        except IntegrityError:
            await db.rollback()
            raise UserAlreadyExistsException(user.email)
        except Exception as e:
            await db.rollback()
            raise DatabaseException(f"create_user: {str(e)}")

    @staticmethod
    async def update_user(user: User, db: AsyncSession) -> User:
        """Update an existing user."""
        try:
            await db.commit()
            await db.refresh(user)
            return user
        except IntegrityError:
            await db.rollback()
            raise UserAlreadyExistsException(user.email)
        except Exception as e:
            await db.rollback()
            raise DatabaseException(f"update_user: {str(e)}")

    @staticmethod
    async def delete_user(user: User, db: AsyncSession) -> bool:
        """Delete a user."""
        try:
            await db.delete(user)
            await db.commit()
            return True
        except Exception as e:
            await db.rollback()
            raise DatabaseException(f"delete_user: {str(e)}")

    @staticmethod
    async def user_exists(email: str, db: AsyncSession) -> bool:
        """Check if user exists by email."""
        try:
            user = await UserDAO.get_user_by_email(email, db)
            return user is not None
        except DatabaseException:
            raise
        except Exception as e:
            raise DatabaseException(f"user_exists: {str(e)}")

    @staticmethod
    async def get_user_by_email_or_raise(
        email: str, db: AsyncSession
    ) -> User:
        """Get user by email or raise UserNotFoundException."""
        user = await UserDAO.get_user_by_email(email, db)
        if user is None:
            raise UserNotFoundException(email)
        return user

    @staticmethod
    async def get_user_by_id_or_raise(
        user_id: int, db: AsyncSession
    ) -> User:
        """Get user by ID or raise UserNotFoundException."""
        user = await UserDAO.get_user_by_id(user_id, db)
        if user is None:
            raise UserNotFoundException(str(user_id))
        return user
    
class SurveyDAO:
    @staticmethod
    async def create_survey(user_id: int, topic: str, questions: list, db: AsyncSession) -> SurveyOut:
        survey = Survey(
            user_id=user_id,
            topic=topic,
            questions=json.dumps(questions)
        )
        db.add(survey)
        await db.commit()
        await db.refresh(survey)
        
        # Manually construct the SurveyOut model before returning
        return SurveyOut(
            id=survey.id,
            topic=survey.topic,
            questions=questions,  # Use the original list, not the json string
            created_at=survey.created_at,
            public_id=survey.public_id,
            archived=survey.archived,
        )

    @staticmethod
    async def get_surveys_by_user(user_id: int, db: AsyncSession):
        result = await db.execute(select(Survey).where(Survey.user_id == user_id))
        surveys = result.scalars().all()
        return surveys
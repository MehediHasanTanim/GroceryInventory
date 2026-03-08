from typing import Optional
from common.application.unit_of_work import UnitOfWork
from auth_service.app.domain.models import User, Role
from auth_service.app.application.dto import UserCreateDTO, UserUpdateDTO
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt
import logging

from common.config import settings

logger = logging.getLogger(__name__)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthService:
    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    def register_user(self, user_data: UserCreateDTO) -> User:
        try:
            with self.uow:
                # Check if user exists
                existing_user = self.uow.users.get_by_username(user_data.username)
                if existing_user:
                    raise ValueError("Username already exists")
                
                hashed_password = pwd_context.hash(user_data.password)
                new_user = User(
                    username=user_data.username,
                    email=user_data.email,
                    password_hash=hashed_password,
                    role=user_data.role
                )
                user = self.uow.users.add(new_user)
                # UoW will commit on __exit__ if no exception occurs
                return user
        except Exception as e:
            logger.error(f"Error registering user: {str(e)}")
            # UoW will rollback on __exit__ if exception occurs
            raise

    def authenticate_user(self, username: str, password: str) -> Optional[User]:
        try:
            with self.uow:
                user = self.uow.users.get_by_username(username)
                if not user:
                    return None
                if not pwd_context.verify(password, user.password_hash):
                    return None
                return user
        except Exception as e:
            logger.error(f"Error authenticating user: {str(e)}")
            raise

    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None):
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        return encoded_jwt

    def list_users(self, limit: int = 100, offset: int = 0):
        try:
            with self.uow:
                return self.uow.users.list(limit=limit, offset=offset)
        except Exception as e:
            logger.error(f"Error listing users: {str(e)}")
            raise

    def update_user(self, user_id: str, data: UserUpdateDTO) -> Optional[User]:
        try:
            with self.uow:
                user = self.uow.users.get_by_id(user_id)
                if not user:
                    return None
                
                if data.username is not None:
                    user.username = data.username
                if data.email is not None:
                    user.email = data.email
                if data.role is not None:
                    user.role = data.role
                if data.is_active is not None:
                    user.is_active = data.is_active
                
                updated_user = self.uow.users.update(user)
                return updated_user
        except Exception as e:
            logger.error(f"Error updating user: {str(e)}")
            raise

    def delete_user(self, user_id: str) -> bool:
        try:
            with self.uow:
                return self.uow.users.delete(user_id)
        except Exception as e:
            logger.error(f"Error deleting user: {str(e)}")
            raise

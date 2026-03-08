from typing import Optional, List
import logging
from sqlalchemy.orm import Session
from common.domain.repository import Repository
from auth_service.app.domain.models import User, Role
from auth_service.app.infrastructure.persistence.models import UserModel

logger = logging.getLogger(__name__)

class SqlAlchemyUserRepository(Repository[User]):
    def __init__(self, db: Session):
        self.db = db

    def add(self, entity: User) -> User:
        logger.info(f"Adding new user: {entity.username}")
        db_user = UserModel(**entity.model_dump())
        self.db.add(db_user)
        return entity

    def get_by_id(self, id: str) -> Optional[User]:
        logger.debug(f"Getting user by id: {id}")
        db_user = self.db.query(UserModel).filter(UserModel.id == id).first()
        return User.model_validate(db_user) if db_user else None

    def get_by_username(self, username: str) -> Optional[User]:
        logger.debug(f"Getting user by username: {username}")
        db_user = self.db.query(UserModel).filter(UserModel.username == username).first()
        return User.model_validate(db_user) if db_user else None

    def list(self, limit: int = 100, offset: int = 0) -> List[User]:
        logger.debug(f"Listing users with limit={limit}, offset={offset}")
        db_users = self.db.query(UserModel).limit(limit).offset(offset).all()
        return [User.model_validate(u) for u in db_users]

    def update(self, entity: User) -> User:
        logger.info(f"Updating user: {entity.username}")
        db_user = self.db.query(UserModel).filter(UserModel.id == entity.id).first()
        if db_user:
            data = entity.model_dump()
            for key, value in data.items():
                setattr(db_user, key, value)
        return entity

    def delete(self, id: str) -> bool:
        logger.info(f"Deleting user with id: {id}")
        db_user = self.db.query(UserModel).filter(UserModel.id == id).first()
        if db_user:
            self.db.delete(db_user)
            return True
        return False

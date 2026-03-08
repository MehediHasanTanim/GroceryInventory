from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase, Session
from typing import Generator
import os

# Create a base class for SQLAlchemy models
class Base(DeclarativeBase):
    pass

class Database:
    def __init__(self, url: str):
        self._engine = create_engine(url, echo=False)
        self._session_factory = sessionmaker(
            autocommit=False,
            autoflush=False,
            bind=self._engine
        )

    def create_database(self):
        Base.metadata.create_all(self._engine)

    def get_db(self) -> Generator[Session, None, None]:
        db = self._session_factory()
        try:
            yield db
        finally:
            db.close()

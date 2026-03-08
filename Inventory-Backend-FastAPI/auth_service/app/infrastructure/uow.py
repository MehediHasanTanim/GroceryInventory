from common.application.unit_of_work import UnitOfWork
from sqlalchemy.orm import Session
from auth_service.app.infrastructure.persistence.repositories import SqlAlchemyUserRepository

class SqlAlchemyAuthUnitOfWork(UnitOfWork):
    def __init__(self, session_factory):
        self.session_factory = session_factory
        self.session = None

    def __enter__(self):
        self.session = self.session_factory()
        self.users = SqlAlchemyUserRepository(self.session)
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        try:
            if exc_type:
                self.rollback()
            else:
                self.commit()
        finally:
            self.session.close()

    def commit(self):
        self.session.commit()

    def rollback(self):
        self.session.rollback()

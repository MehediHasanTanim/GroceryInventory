from sqlalchemy import Column, String, Boolean
from common.infrastructure.database import Base

class UserModel(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    role = Column(String, default="staff")
    is_active = Column(Boolean, default=True)

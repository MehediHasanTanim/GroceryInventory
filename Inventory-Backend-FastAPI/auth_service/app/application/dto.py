from typing import Optional
from pydantic import BaseModel, EmailStr
from auth_service.app.domain.models import Role

class UserCreateDTO(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: Role = Role.STAFF

class UserUpdateDTO(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[Role] = None
    is_active: Optional[bool] = None

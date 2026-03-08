from pydantic import BaseModel
from typing import Optional
from common.domain.enums import Role
from pydantic import EmailStr

class UserRegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: Role = Role.STAFF

class UserUpdateRequest(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[Role] = None
    is_active: Optional[bool] = None

class UserLoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    role: Role
    is_active: bool

    class Config:
        from_attributes = True

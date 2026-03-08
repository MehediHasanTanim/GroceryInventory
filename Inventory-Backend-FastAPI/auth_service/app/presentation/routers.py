from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from typing import Generator
from common.infrastructure.database import Database
from auth_service.app.presentation.schemas import UserResponse, TokenResponse, UserLoginRequest, UserRegisterRequest, UserUpdateRequest
from auth_service.app.application.auth_service import AuthService
from auth_service.app.application.dto import UserCreateDTO, UserUpdateDTO
from auth_service.app.infrastructure.uow import SqlAlchemyAuthUnitOfWork
from datetime import timedelta
from common.config import settings
from common.security import admin_required

DATABASE_URL = settings.DATABASE_URL_AUTH
database = Database(DATABASE_URL)

def get_uow() -> Generator[SqlAlchemyAuthUnitOfWork, None, None]:
    uow = SqlAlchemyAuthUnitOfWork(database._session_factory)
    yield uow

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(admin_required)])
def register(request: UserRegisterRequest, uow: SqlAlchemyAuthUnitOfWork = Depends(get_uow)):
    service = AuthService(uow)
    try:
        dto = UserCreateDTO(
            username=request.username,
            email=request.email,
            password=request.password,
            role=request.role
        )
        user = service.register_user(dto)
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/token", response_model=TokenResponse)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), uow: SqlAlchemyAuthUnitOfWork = Depends(get_uow)):
    service = AuthService(uow)
    user = service.authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = service.create_access_token(
        data={"sub": user.username, "role": user.role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=TokenResponse)
def login(request: UserLoginRequest, uow: SqlAlchemyAuthUnitOfWork = Depends(get_uow)):
    service = AuthService(uow)
    user = service.authenticate_user(request.username, request.password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = service.create_access_token(
        data={"sub": user.username, "role": user.role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/users", response_model=list[UserResponse], dependencies=[Depends(admin_required)])
def list_users(limit: int = 100, offset: int = 0, uow: SqlAlchemyAuthUnitOfWork = Depends(get_uow)):
    service = AuthService(uow)
    return service.list_users(limit=limit, offset=offset)

@router.put("/users/{user_id}", response_model=UserResponse, dependencies=[Depends(admin_required)])
def update_user(user_id: str, request: UserUpdateRequest, uow: SqlAlchemyAuthUnitOfWork = Depends(get_uow)):
    service = AuthService(uow)
    dto = UserUpdateDTO(**request.model_dump(exclude_unset=True))
    user = service.update_user(user_id, dto)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(admin_required)])
def delete_user(user_id: str, uow: SqlAlchemyAuthUnitOfWork = Depends(get_uow)):
    service = AuthService(uow)
    success = service.delete_user(user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return None

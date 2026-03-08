from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # Database URLs
    DATABASE_URL_AUTH: Optional[str] = None
    DATABASE_URL_INVENTORY: Optional[str] = None
    DATABASE_URL_SALES: Optional[str] = None
    DATABASE_URL_SUPPLIER: Optional[str] = None

    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

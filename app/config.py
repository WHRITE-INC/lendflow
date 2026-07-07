import os
from pydantic import Field
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    supabase_url: str = Field(..., env="SUPABASE_URL")
    supabase_key: str = Field(..., env="SUPABASE_KEY")
    supabase_service_key: str = Field(..., env="SUPABASE_SERVICE_KEY")
    api_secret_key: str = Field(..., env="API_SECRET_KEY")
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440  # 24 Hours

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

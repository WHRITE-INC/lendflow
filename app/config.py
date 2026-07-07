import os
from pathlib import Path
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

# Dynamically locate the root directory containing the project .env configuration
BASE_DIR = Path(__file__).resolve().parent.parent
ENV_FILE_PATH = BASE_DIR / ".env"

class Settings(BaseSettings):
    supabase_url: str
    supabase_key: str
    supabase_service_key: str
    api_secret_key: str
    
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440

    # Explicit configuration loader matching the exact physical path
    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE_PATH),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

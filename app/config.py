import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent
ENV_FILE_PATH = BASE_DIR / ".env"

class Settings(BaseSettings):
    supabase_url: str = ""
    supabase_key: str = ""
    supabase_service_key: str = ""
    api_secret_key: str = ""
    
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440

    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE_PATH),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Dynamic fallback matching both plain and NEXT_PUBLIC prefixes securely
        self.supabase_url = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL") or self.supabase_url
        self.supabase_key = os.getenv("SUPABASE_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY") or self.supabase_key
        self.supabase_service_key = os.getenv("SUPABASE_SERVICE_KEY") or self.supabase_service_key
        self.api_secret_key = os.getenv("API_SECRET_KEY") or self.api_secret_key

        # Raise explicit developer exceptions if variables are genuinely absent
        if not self.supabase_url or not self.supabase_key or not self.supabase_service_key:
            raise ValueError("Configuration Missing: Check your local .env keys are completely populated.")

settings = Settings()

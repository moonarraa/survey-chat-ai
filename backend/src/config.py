from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    sync_database_url: str
    async_database_url: str
    secret_key: str
    algorithm: str
    openai_api_key: str
    google_client_id: str
    google_client_secret: str
    google_redirect_url: str
    frontend_url: str = Field(alias="FRONTEND_URL")
    environment: str = "development"  # По умолчанию development
    simple_api_key: str = "change-me-in-production" # Simple key for convenience endpoints
    access_token_expire_minutes: int = 43200  # Token expiration in minutes (30 days)

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )


settings = Settings()
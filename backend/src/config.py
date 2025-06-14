from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    sync_database_url: str
    async_database_url: str
    secret_key: str
    algorithm: str
    access_token_expire_minutes: int
    openai_api_key: str

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8"
    )


settings = Settings()
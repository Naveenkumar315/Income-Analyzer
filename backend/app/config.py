# app/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    db_url: str
    db_name: str

    class Config:
        env_file = ".env"

settings = Settings()

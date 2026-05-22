"""Typed configuration — single source of truth for all env vars."""
import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    FRED_API_KEY:        str | None = os.getenv("FRED_API_KEY")
    REDIS_HOST:          str | None = os.getenv("REDIS_HOST")
    REDIS_PORT:          int        = int(os.getenv("REDIS_PORT", 6379))
    REDIS_PASSWORD:      str | None = os.getenv("REDIS_PASSWORD")
    GROQ_API_KEY:        str | None = os.getenv("GROQ_API_KEY")

settings = Settings()

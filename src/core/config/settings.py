# settings.py

import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

class Settings:
    # ---------------------------------------------------------
    # APP CONFIG
    # ---------------------------------------------------------
    APP_NAME = "ecommerce app"
    APP_PORT = "8000"

    # ---------------------------------------------------------
    # DATABASE (POSTGRES)
    # ---------------------------------------------------------
    DATABASE_URL = os.getenv("DATABASE_URL")

    # ---------------------------------------------------------
    # CHROMA VECTOR DB
    # ---------------------------------------------------------
    CHROMA_PATH = os.getenv("CHROMA_PATH")
    CHROMA_COLLECTION = os.getenv("CHROMA_COLLECTION")

    # ---------------------------------------------------------
    # EMBEDDING MODEL (Ollama)
    # ---------------------------------------------------------
    EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL")
    OLLAMA_HOST = os.getenv("OLLAMA_HOST")  # Change this in env if you use localhost
    EMBEDDING_TIMEOUT = 30

    # ---------------------------------------------------------
    # JWT AUTH
    # ---------------------------------------------------------
    JWT_SECRET = os.getenv("JWT_SECRET")
    JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", 30))
    JWT_REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("JWT_REFRESH_TOKEN_EXPIRE_DAYS", 7))
    REFRESH_TOKEN_KEY = str(os.getenv("REFRESH_TOKEN_KEY"))

    # ---------------------------------------------------------
    # PASSWORD HASHING
    # ---------------------------------------------------------
    PASSWORD_HASH_SCHEME = os.getenv("HASHING_SCHEME", "bcrypt")

    # ---------------------------------------------------------
    # REDIS
    # ---------------------------------------------------------
    REDIS_HOST: str = "redis"
    REDIS_PORT: int = 6379

    # ---------------------------------------------------------
    # EMAIL (optional)
    # ---------------------------------------------------------
    SMTP_HOST = os.getenv("SMTP_HOST")
    SMTP_PORT = os.getenv("SMTP_PORT")
    SMTP_USER = os.getenv("SMTP_USER")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
    SMTP_SENDER = os.getenv("SMTP_FROM")

    # ---------------------------------------------------------
    # LOGGING
    # ---------------------------------------------------------
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    LOG_FORMAT = os.getenv("LOG_FORMAT", "default")

    # ---------------------------------------------------------
    # PAYPAL
    # ---------------------------------------------------------
    PAYPAL_CLIENT_ID = os.getenv("PAYPAL_CLIENT_ID")
    PAYPAL_SECRET = os.getenv("PAYPAL_SECRET")
    PAYPAL_MODE = os.getenv("PAYPAL_MODE", "sandbox")
    PAYPAL_RETURN_URL = os.getenv("PAYPAL_RETURN_URL")
    PAYPAL_CANCEL_URL = os.getenv("PAYPAL_CANCEL_URL")

    # ---------------------------------------------------------
    # TAX
    # ---------------------------------------------------------
    TAX_RATE: float = 0.20


settings = Settings()

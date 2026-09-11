# src/core/config/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from core.config.settings import settings

class Base(DeclarativeBase):
    pass

# ---------------------------------------------------------
# ENGINE
# ---------------------------------------------------------
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,        # usually False in production
    future=True,
    pool_pre_ping=True,
)


SYNC_DATABASE_URL = settings.DATABASE_URL.replace("+asyncpg", "")

sync_engine = create_engine(
    SYNC_DATABASE_URL,
    echo=False,
)


# ---------------------------------------------------------
# SESSION FACTORY
# ---------------------------------------------------------
async_session_factory = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


# ---------------------------------------------------------
# DEPENDENCY: get_session
# ---------------------------------------------------------
async def get_session() -> AsyncSession:
    async with async_session_factory() as session:
        try:
            yield session
        finally:
            await session.close()

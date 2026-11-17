from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from core.config.settings import settings

Base = declarative_base()


# ---------------------------------------------------------
# ENGINE
# ---------------------------------------------------------
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True,
    pool_pre_ping=True,
)


# ---------------------------------------------------------
# SESSION FACTORY (eagerly bound)
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
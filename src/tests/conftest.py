import sys
import os

# ---------------------------------------------------------
# TESTING MODE
# ---------------------------------------------------------
# Disable Redis-based rate limiting during pytest.
os.environ["TESTING"] = "true"

# Use SQLite for tests
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///:memory:"


# ---------------------------------------------------------
# MAKE SRC IMPORTABLE
# ---------------------------------------------------------
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)


# ---------------------------------------------------------
# PATCH create_async_engine BEFORE importing models
# ---------------------------------------------------------
# The database.py imports create_async_engine directly and uses it at module level.
# We need to patch it in the sqlalchemy.ext.asyncio module before database.py is imported.
import sqlalchemy.ext.asyncio as asyncio_module
from sqlalchemy.pool import StaticPool

_original_create_async_engine = asyncio_module.create_async_engine

def _patched_create_async_engine(url, *args, **kwargs):
    if url.startswith("sqlite"):
        # Use StaticPool (default for SQLite) to share in-memory DB across connections
        # Remove pooling params that SQLite doesn't support
        for param in ("pool_size", "max_overflow", "pool_timeout", "pool_recycle"):
            kwargs.pop(param, None)
        # Don't set poolclass - let SQLAlchemy use default StaticPool for SQLite
    return _original_create_async_engine(url, *args, **kwargs)

# Apply patch to the module so database.py's import gets the patched version
asyncio_module.create_async_engine = _patched_create_async_engine


# ---------------------------------------------------------
# DATABASE MODELS
# ---------------------------------------------------------
from catalog.infrastructure.db.category_model import CategoryModel
from order.infrastructure.db.order_item_model import OrderItemModel
from order.infrastructure.db.order_model import OrderModel
from payment.infrastructure.db.payment_model import PaymentModel
from auth.infrastructure.db.user_model import UserModel
from auth.infrastructure.db.token_model import RefreshTokenModel
from cart.infrastructure.db.cart_item_model import CartItemModel
from cart.infrastructure.db.cart_model import CartModel
from catalog.infrastructure.db.product_model import ProductModel


# ---------------------------------------------------------
# PYTEST
# ---------------------------------------------------------
import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

# Import the global engine and Base from database.py (now patched)
from core.infrastructure.database import engine, Base


# ---------------------------------------------------------
# DATABASE SESSION MAKER
# ---------------------------------------------------------
@pytest_asyncio.fixture
async def async_session_maker():
    # Use the global engine (already patched for SQLite with NullPool)
    session_maker = async_sessionmaker(
        engine,
        expire_on_commit=False,
        class_=AsyncSession,
    )

    # Create all tables using the Base metadata (includes all models)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield session_maker

    # Clean up: drop all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await engine.dispose()


# ---------------------------------------------------------
# DATABASE SESSION
# ---------------------------------------------------------
@pytest_asyncio.fixture
async def db_session(async_session_maker):
    async with async_session_maker() as session:
        yield session
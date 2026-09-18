import sys
import os

from catalog.infrastructure.db.category_model import CategoryModel
from order.infrastructure.db.order_item_model import OrderItemModel
from order.infrastructure.db.order_model import OrderModel
from payment.infrastructure.db.payment_model import PaymentModel
from auth.infrastructure.db.user_model import UserModel
from auth.infrastructure.db.token_model import RefreshTokenModel
from cart.infrastructure.db.cart_item_model import CartItemModel
from cart.infrastructure.db.cart_model import CartModel
from catalog.infrastructure.db.product_model import ProductModel

# Make src/ importable
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)

import pytest_asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

TEST_DB_URL = "sqlite+aiosqlite:///:memory:"


@pytest_asyncio.fixture
async def async_session_maker():
    engine = create_async_engine(TEST_DB_URL, echo=False)
    session_maker = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

    async with engine.begin() as conn:
        await conn.run_sync(UserModel.metadata.create_all)
        await conn.run_sync(RefreshTokenModel.metadata.create_all)


        await conn.run_sync(CartModel.metadata.create_all)
        await conn.run_sync(CartItemModel.metadata.create_all)

        await conn.run_sync(ProductModel.metadata.create_all)
        await conn.run_sync(CategoryModel.metadata.create_all)

        await conn.run_sync(OrderModel.metadata.create_all)
        await conn.run_sync(OrderItemModel.metadata.create_all)

        await conn.run_sync(PaymentModel.metadata.create_all)


    yield session_maker

    await engine.dispose()


@pytest_asyncio.fixture
async def db_session(async_session_maker):
    async with async_session_maker() as session:
        yield session

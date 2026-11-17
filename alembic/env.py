import os
import sys
from logging.config import fileConfig

from alembic import context
from sqlalchemy import pool

# -------------------------------------------------------------------
# PYTHONPATH FIX
# -------------------------------------------------------------------
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SRC_DIR = os.path.join(BASE_DIR, "src")

sys.path.append(BASE_DIR)
sys.path.append(SRC_DIR)

# -------------------------------------------------------------------
# LOAD ENV & SETTINGS (for DATABASE_URL)
# -------------------------------------------------------------------
from dotenv import load_dotenv
load_dotenv(os.path.join(BASE_DIR, ".env"))

from core.config.settings import settings

# -------------------------------------------------------------------
# IMPORT MODELS
# -------------------------------------------------------------------
from auth.infrastructure.db.user_model import UserModel
from auth.infrastructure.db.token_model import RefreshTokenModel
from cart.infrastructure.db.cart_model import CartModel
from cart.infrastructure.db.cart_item_model import CartItemModel
from catalog.infrastructure.db.category_model import CategoryModel
from catalog.infrastructure.db.product_model import ProductModel
from order.infrastructure.db.order_model import OrderModel
from order.infrastructure.db.order_item_model import OrderItemModel
from payment.infrastructure.db.payment_model import PaymentModel
from search.infrastructure.db.embedding_model import ProductEmbeddingModel

# -------------------------------------------------------------------
# IMPORT DATABASE BASE
# -------------------------------------------------------------------
from core.infrastructure.database import Base

# -------------------------------------------------------------------
# ALEMBIC CONFIG
# -------------------------------------------------------------------
config = context.config
fileConfig(config.config_file_name)

# Override sqlalchemy.url from settings (env var)
# Convert asyncpg URL to psycopg2 for synchronous alembic migrations
sync_db_url = settings.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://").replace("postgresql+asyncpg:", "postgresql:")
config.set_main_option("sqlalchemy.url", sync_db_url)

target_metadata = Base.metadata


# -------------------------------------------------------------------
# OFFLINE MIGRATIONS
# -------------------------------------------------------------------
def run_migrations_offline():
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
        compare_server_default=True,
    )

    with context.begin_transaction():
        context.run_migrations()


# -------------------------------------------------------------------
# ONLINE MIGRATIONS (SYNC)
# -------------------------------------------------------------------
def run_migrations_online():
    # Use sync URL directly to avoid engine_from_config reading wrong URL
    # Use postgresql+psycopg2:// explicitly to avoid psycopg3 requirement
    sync_db_url = settings.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql+psycopg2://").replace("postgresql+asyncpg:", "postgresql+psycopg2:")
    from sqlalchemy import create_engine
    connectable = create_engine(sync_db_url, poolclass=pool.NullPool)

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
        )

        with context.begin_transaction():
            context.run_migrations()


# -------------------------------------------------------------------
# ENTRYPOINT
# -------------------------------------------------------------------
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
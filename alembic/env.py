import os
import sys
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

# -------------------------------------------------------------------
# PYTHONPATH FIX
# -------------------------------------------------------------------
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SRC_DIR = os.path.join(BASE_DIR, "src")

sys.path.append(BASE_DIR)
sys.path.append(SRC_DIR)

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

# -------------------------------------------------------------------
# IMPORT DATABASE BASE
# -------------------------------------------------------------------
from core.infrastructure.database import Base

# -------------------------------------------------------------------
# ALEMBIC CONFIG
# -------------------------------------------------------------------
config = context.config
fileConfig(config.config_file_name)

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
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

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

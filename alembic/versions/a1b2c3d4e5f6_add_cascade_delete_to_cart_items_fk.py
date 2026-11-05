"""add cascade delete to cart_items product_id fk

Revision ID: a1b2c3d4e5f6
Revises: 177feed20c33
Create Date: 2026-11-05 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '177feed20c33'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Drop the existing foreign key constraint
    op.drop_constraint('cart_items_product_id_fkey', 'cart_items', type_='foreignkey')
    
    # Recreate it with CASCADE delete
    op.create_foreign_key(
        'cart_items_product_id_fkey',
        'cart_items', 'products',
        ['product_id'], ['id'],
        ondelete='CASCADE'
    )


def downgrade() -> None:
    """Downgrade schema."""
    # Drop the CASCADE foreign key
    op.drop_constraint('cart_items_product_id_fkey', 'cart_items', type_='foreignkey')
    
    # Recreate without CASCADE
    op.create_foreign_key(
        'cart_items_product_id_fkey',
        'cart_items', 'products',
        ['product_id'], ['id']
    )
"""add fk to order_items product_id with set null

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-11-05 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c3d4e5f6a7b8'
down_revision: Union[str, Sequence[str], None] = 'b2c3d4e5f6a7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Make product_id nullable first
    op.alter_column('order_items', 'product_id', nullable=True)
    
    # Add the foreign key constraint
    op.create_foreign_key(
        'order_items_product_id_fkey',
        'order_items', 'products',
        ['product_id'], ['id'],
        ondelete='SET NULL'
    )


def downgrade() -> None:
    """Downgrade schema."""
    # Drop the foreign key constraint
    op.drop_constraint('order_items_product_id_fkey', 'order_items', type_='foreignkey')
    
    # Make product_id non-nullable
    op.alter_column('order_items', 'product_id', nullable=False)
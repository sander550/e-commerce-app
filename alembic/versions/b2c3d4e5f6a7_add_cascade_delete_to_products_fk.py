"""add cascade delete to products category_id fk

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-11-05 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b2c3d4e5f6a7'
down_revision: Union[str, Sequence[str], None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Drop the existing foreign key constraint
    op.drop_constraint('products_category_id_fkey', 'products', type_='foreignkey')
    
    # Recreate it with CASCADE delete
    op.create_foreign_key(
        'products_category_id_fkey',
        'products', 'categories',
        ['category_id'], ['id'],
        ondelete='CASCADE'
    )


def downgrade() -> None:
    """Downgrade schema."""
    # Drop the CASCADE foreign key
    op.drop_constraint('products_category_id_fkey', 'products', type_='foreignkey')
    
    # Recreate without CASCADE
    op.create_foreign_key(
        'products_category_id_fkey',
        'products', 'categories',
        ['category_id'], ['id']
    )
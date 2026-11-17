"""add pgvector extension and product_embeddings table

Revision ID: 1434fa6f9672
Revises: efb5cf81887c
Create Date: 2026-11-14 09:59:53.634862

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1434fa6f9672'
down_revision: Union[str, Sequence[str], None] = 'efb5cf81887c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Enable pgvector extension
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    # Create product_embeddings table
    op.create_table(
        "product_embeddings",
        sa.Column("product_id", sa.Integer, sa.ForeignKey("products.id", ondelete="CASCADE"), primary_key=True, nullable=False),
        sa.Column("embedding", sa.Text, nullable=False),  # pgvector uses text representation; Vector type handled by pgvector.sqlalchemy
    )

    # Create HNSW index for fast vector search (optional but recommended)
    # op.execute("CREATE INDEX ON product_embeddings USING hnsw (embedding vector_cosine_ops)")


def downgrade() -> None:
    op.drop_table("product_embeddings")
    op.execute("DROP EXTENSION IF EXISTS vector")
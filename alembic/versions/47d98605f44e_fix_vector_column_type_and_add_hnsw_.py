"""fix vector column type and add hnsw index

Revision ID: 47d98605f44e
Revises: 1434fa6f9672
Create Date: 2026-11-16 13:12:04.249022

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '47d98605f44e'
down_revision: Union[str, Sequence[str], None] = '1434fa6f9672'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Cast text column to vector(1024) - bge-large produces 1024-dim embeddings
    op.execute("ALTER TABLE product_embeddings ALTER COLUMN embedding TYPE vector(1024) USING embedding::vector(1024)")
    
    # Create HNSW index for fast cosine similarity search
    op.execute("CREATE INDEX IF NOT EXISTS product_embeddings_embedding_hnsw_idx ON product_embeddings USING hnsw (embedding vector_cosine_ops)")


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS product_embeddings_embedding_hnsw_idx")
    op.execute("ALTER TABLE product_embeddings ALTER COLUMN embedding TYPE text USING embedding::text")
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Integer, ForeignKey
from pgvector.sqlalchemy import Vector
from core.infrastructure.database import Base


class ProductEmbeddingModel(Base):
    __tablename__ = "product_embeddings"

    product_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("products.id", ondelete="CASCADE"),
        primary_key=True,
    )
    embedding: Mapped[list[float]] = mapped_column(Vector, nullable=False)
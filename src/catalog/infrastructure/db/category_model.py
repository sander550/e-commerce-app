# src/catalog/infrastructure/models/category_model.py

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, String, ForeignKey
from core.infrastructure.database import Base


class CategoryModel(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)

    parent_id: Mapped[int | None] = mapped_column(
        ForeignKey("categories.id"),
        nullable=True
    )

    parent: Mapped["CategoryModel | None"] = relationship(
        remote_side=[id],
        backref="children"
    )

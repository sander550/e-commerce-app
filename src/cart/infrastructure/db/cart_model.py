from sqlalchemy import Column, Integer, Float, String, ForeignKey
from sqlalchemy.orm import relationship
from core.infrastructure.database import Base


class CartModel(Base):
    __tablename__ = "carts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, unique=True, index=True)

    # Relationship to items
    items = relationship(
        "CartItemModel",
        back_populates="cart",
        cascade="all, delete-orphan"
    )

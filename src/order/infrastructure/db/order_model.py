from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from core.infrastructure.database import Base

class OrderModel(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)

    shipping_address = Column(String(500), nullable=True)
    delivery_method = Column(String(50), nullable=True)   # ⭐ NEW FIELD

    subtotal = Column(Float, nullable=False)
    tax = Column(Float, nullable=False)
    total = Column(Float, nullable=False)

    status = Column(String(50), default="pending", nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)

    items = relationship(
        "OrderItemModel",
        back_populates="order",
        cascade="all, delete-orphan"
    )

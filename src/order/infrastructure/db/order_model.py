from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from core.infrastructure.database import Base
from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship


class OrderModel(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)

    shipping_address = Column(String(500), nullable=True)
    delivery_method = Column(String(50), nullable=True)

    subtotal = Column(Float, nullable=False)
    tax = Column(Float, nullable=False)
    total = Column(Float, nullable=False)

    status = Column(String(50), default="pending", nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Stock is reserved until this time.
    reservation_expires_at = Column(DateTime, nullable=True)

    items = relationship(
        "OrderItemModel",
        back_populates="order",
        cascade="all, delete-orphan"
    )
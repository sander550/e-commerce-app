from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from core.infrastructure.database import Base


class OrderItemModel(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)

    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"))
    product_id = Column(Integer, nullable=False)

    name = Column(String(255), nullable=False)
    price = Column(Float, nullable=False)
    quantity = Column(Integer, nullable=False)
    image_url = Column(String(500), nullable=True)

    order = relationship("OrderModel", back_populates="items")

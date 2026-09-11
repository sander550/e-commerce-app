from sqlalchemy import Column, Integer, Float, String, ForeignKey
from sqlalchemy.orm import relationship
from core.infrastructure.database import Base


class CartItemModel(Base):
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True)
    cart_id = Column(Integer, ForeignKey("carts.id", ondelete="CASCADE"))
    product_id = Column(Integer, ForeignKey("products.id"), index=True)

    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    name = Column(String, nullable=False)
    image_url = Column(String, nullable=True)

    cart = relationship("CartModel", back_populates="items")

    # ⭐ REQUIRED RELATIONSHIP ⭐
    product = relationship("ProductModel")


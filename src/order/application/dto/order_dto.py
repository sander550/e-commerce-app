from pydantic import BaseModel
from typing import List

class PlaceOrderDTO(BaseModel):
    shipping_address: str
    delivery_method: str


class OrderItemResponseDTO(BaseModel):
    product_id: int
    name: str
    price: float
    quantity: int
    image_url: str | None

    @staticmethod
    def from_domain(item) -> "OrderItemResponseDTO":
        return OrderItemResponseDTO(
            product_id=item.product_id,
            name=item.name,
            price=item.price,
            quantity=item.quantity,
            image_url=item.image_url
        )



class OrderResponseDTO(BaseModel):
    id: int
    user_id: int
    shipping_address: str
    delivery_method: str
    subtotal: float
    tax: float
    total: float
    status: str
    created_at: str
    items: List[OrderItemResponseDTO]

    @staticmethod
    def from_domain(order) -> "OrderResponseDTO":
        return OrderResponseDTO(
            id=order.id,
            user_id=order.user_id,
            shipping_address=order.shipping_address,
            delivery_method=order.delivery_method,
            subtotal=order.subtotal,
            tax=order.tax,
            total=order.total,
            status=order.status,
            created_at=order.created_at.isoformat(),
            items=[OrderItemResponseDTO.from_domain(i) for i in order.items]
        )

from dataclasses import dataclass

@dataclass
class OrderItem:
    product_id: int
    name: str
    price: float
    quantity: int
    image_url: str | None = None

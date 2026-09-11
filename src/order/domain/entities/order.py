from dataclasses import dataclass, field
from datetime import datetime
from typing import List
from order.domain.entities.order_item import OrderItem

@dataclass
class Order:
    id: int | None
    user_id: int
    shipping_address: str
    delivery_method: str
    items: List[OrderItem] = field(default_factory=list)
    subtotal: float = 0.0
    tax: float = 0.0
    total: float = 0.0
    status: str = "pending"
    created_at: datetime = field(default_factory=datetime.utcnow)

    def calculate_totals(self, tax_rate: float = 0.2):
        self.subtotal = sum(item.price * item.quantity for item in self.items)
        self.tax = round(self.subtotal * tax_rate, 2)
        self.total = round(self.subtotal + self.tax, 2)

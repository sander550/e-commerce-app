from dataclasses import dataclass
from typing import List
from cart.domain.entities.cart_item import CartItem

@dataclass
class Cart:
    user_id: int
    items: List[CartItem]

    def remove_item(self, product_id: int):
        self.items = [item for item in self.items if item.product_id != product_id]

    def update_quantity(self, product_id: int, quantity: int):
        for item in self.items:
            if item.product_id == product_id:
                item.quantity = quantity
                return

from abc import ABC, abstractmethod
from typing import Optional
from cart.domain.entities.cart import Cart


class ICartRepository(ABC):

    @abstractmethod
    async def get_by_user_id(self, user_id: int) -> Optional[Cart]:
        """Load the cart for a specific user."""
        pass

    @abstractmethod
    async def save(self, cart: Cart) -> None:
        """Persist the cart (insert or update)."""
        pass

    @abstractmethod
    async def clear(self, user_id: int) -> None:
        """Remove all items from the user's cart."""
        pass

    @abstractmethod
    async def delete(self, user_id: int) -> None:
        """Delete the cart entirely (used for guest carts or cleanup)."""
        pass

    @abstractmethod
    async def delete_items_by_product_id(self, product_id: int) -> None:
        """Delete all cart items referencing a specific product."""
        pass

from abc import ABC, abstractmethod
from typing import List, Optional

from order.domain.entities.order import Order


class IOrderRepository(ABC):

    @abstractmethod
    async def save(self, order: Order) -> Order:
        """Persist a new order or update an existing one."""
        raise NotImplementedError

    @abstractmethod
    async def get_by_id(self, order_id: int) -> Optional[Order]:
        """Return a single order by its ID."""
        raise NotImplementedError

    @abstractmethod
    async def list_by_user_id(self, user_id: int) -> List[Order]:
        """Return all orders belonging to a specific user."""
        raise NotImplementedError

    @abstractmethod
    async def delete(self, order_id: int):
        """Delete an existing order by its ID."""
        raise NotImplementedError

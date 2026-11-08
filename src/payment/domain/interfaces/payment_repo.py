from abc import ABC, abstractmethod
from typing import Optional
from payment.domain.entities.payment import Payment


class IPaymentRepository(ABC):

    @abstractmethod
    async def create(self, payment: Payment) -> Payment:
        """Persist a new payment record."""
        pass

    @abstractmethod
    async def get_by_id(self, payment_id: int) -> Optional[Payment]:
        """Fetch a payment by its ID."""
        pass

    @abstractmethod
    async def get_by_order_id(self, order_id: int) -> Optional[Payment]:
        """Fetch a payment associated with a specific order."""
        pass

    @abstractmethod
    async def update(self, payment: Payment) -> Payment:
        """Update payment status or details."""
        pass

    @abstractmethod
    async def get_by_paypal_order_id(self, paypal_order_id: str) -> Optional[Payment]:
        """Fetch a payment by PayPal order ID."""
        pass

from dataclasses import dataclass
from enum import Enum
from datetime import datetime


class PaymentStatus(Enum):
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"


@dataclass
class Payment:
    id: int | None
    order_id: int
    user_id: int
    amount: float
    method: str          # "card", "bank", "paypal", etc.
    paypal_order_id: str | None
    status: PaymentStatus
    created_at: datetime

    def to_dict(self):
        return {
            "id": self.id,
            "order_id": self.order_id,
            "user_id": self.user_id,
            "amount": self.amount,
            "method": self.method,
            "paypal_order_id": self.paypal_order_id,
            "status": self.status.value,
            "created_at": self.created_at.isoformat(),
        }

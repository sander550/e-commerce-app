from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column, declarative_base
from sqlalchemy import Enum as SqlEnum, Float, Integer, String, DateTime
from core.infrastructure.database import Base
from payment.domain.entities.payment import PaymentStatus


class PaymentModel(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    order_id: Mapped[int] = mapped_column(Integer, nullable=False)
    user_id: Mapped[int] = mapped_column(Integer, nullable=False)

    amount: Mapped[float] = mapped_column(Float, nullable=False)
    method: Mapped[str] = mapped_column(String(50), nullable=False)

    # ⭐ ADD THIS FIELD
    paypal_order_id: Mapped[str | None] = mapped_column(String(255), nullable=True)

    status: Mapped[PaymentStatus] = mapped_column(
        SqlEnum(PaymentStatus, name="payment_status"),
        nullable=False,
        default=PaymentStatus.PENDING
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

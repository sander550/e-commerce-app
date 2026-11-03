from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from payment.domain.entities.payment import Payment
from payment.domain.interfaces.payment_repo import IPaymentRepository
from payment.infrastructure.db.payment_model import PaymentModel


class PaymentRepository(IPaymentRepository):
    def __init__(self, session: AsyncSession):
        self.session = session


    # ---------------------------------------------------------
    # INTERNAL MAPPER
    # ---------------------------------------------------------
    def _to_domain(self, model: PaymentModel) -> Payment:
        return Payment(
            id=model.id,
            order_id=model.order_id,
            user_id=model.user_id,
            paypal_order_id=model.paypal_order_id,
            amount=model.amount,
            method=model.method,
            status=model.status,
            created_at=model.created_at
        )

    # ---------------------------------------------------------
    # CREATE PAYMENT
    # ---------------------------------------------------------
    async def create(self, payment: Payment) -> Payment:
        model = PaymentModel(
            order_id=payment.order_id,
            user_id=payment.user_id,
            paypal_order_id=payment.paypal_order_id,
            amount=payment.amount,
            method=payment.method,
            status=payment.status,
        )

        self.session.add(model)
        await self.session.commit()
        await self.session.refresh(model)

        return self._to_domain(model)

    # ---------------------------------------------------------
    # GET BY ID
    # ---------------------------------------------------------
    async def get_by_id(self, payment_id: int) -> Payment | None:
        stmt = select(PaymentModel).where(PaymentModel.id == payment_id)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()

        return self._to_domain(model) if model else None


    # ---------------------------------------------------------
    # GET BY ORDER ID
    # ---------------------------------------------------------
    async def get_by_order_id(self, order_id: int) -> Payment | None:
        stmt = select(PaymentModel).where(PaymentModel.order_id == order_id)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()

        return self._to_domain(model) if model else None

    # ---------------------------------------------------------
    # UPDATE PAYMENT
    # ---------------------------------------------------------
    async def update(self, payment: Payment) -> Payment:
        stmt = select(PaymentModel).where(PaymentModel.id == payment.id)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()

        if not model:
            return None

        model.status = payment.status
        model.method = payment.method
        model.amount = payment.amount

        await self.session.commit()
        await self.session.refresh(model)

        return self._to_domain(model)

    

    async def get_by_paypal_order_id(self, paypal_order_id: str) -> Payment | None:
        stmt = select(PaymentModel).where(PaymentModel.paypal_order_id == paypal_order_id)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()

        if not model:
            return None

        return self._to_domain(model)


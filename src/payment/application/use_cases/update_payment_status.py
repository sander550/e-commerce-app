from payment.domain.interfaces.payment_repo import IPaymentRepository
from payment.domain.entities.payment import PaymentStatus

class UpdatePaymentStatusUseCase:
    def __init__(self, payment_repo: IPaymentRepository):
        self.payment_repo = payment_repo

    async def execute(self, payment_id: int, user_id: int, status: PaymentStatus):
        payment = await self.payment_repo.get_by_id(payment_id)
        if not payment:
            raise ValueError("Payment not found")

        # Ownership check
        if payment.user_id != user_id:
            raise PermissionError("Not your payment")

        payment.status = status
        await self.payment_repo.update(payment)

        return payment

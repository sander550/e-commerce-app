from cart.domain.interfaces.cart_repo import ICartRepository
from payment.domain.interfaces.payment_repo import IPaymentRepository
from payment.domain.entities.payment import PaymentStatus

from core.events.event_bus import event_bus
from core.events.payment_completed_event import PaymentCompletedEvent
from payment.domain.entities.payment import Payment


class CompletePaymentUseCase:
    def __init__(
        self,
        payment_repo: IPaymentRepository,
        cart_repo: ICartRepository,
    ):
        self.payment_repo = payment_repo
        self.cart_repo = cart_repo

    async def execute(self, payment: Payment, user_id: int, status: PaymentStatus):
        # Ownership check
        if payment.user_id != user_id:
            raise PermissionError("Not your payment")

        # Correct enum assignment
        payment.status = status
        await self.payment_repo.update(payment)

        # Correct enum comparison
        if payment.status == PaymentStatus.SUCCESS:
            event = PaymentCompletedEvent.create(
                payment_id=payment.id,
                order_id=payment.order_id,
                user_id=payment.user_id,
                amount=payment.amount
            )
            await event_bus.publish(event)

        return payment

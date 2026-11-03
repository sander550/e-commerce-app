from datetime import datetime
from payment.domain.entities.payment import Payment, PaymentStatus
from payment.domain.interfaces.payment_repo import IPaymentRepository
from order.domain.interfaces.order_repo import IOrderRepository
from payment.domain.services.paypal_services import paypal_service


class CreatePayPalPaymentUseCase:
    def __init__(self, payment_repo: IPaymentRepository, order_repo: IOrderRepository):
        self.payment_repo = payment_repo
        self.order_repo = order_repo

    async def execute(self, order_id: int, user_id: int):
        order = await self.order_repo.get_by_id(order_id)
        if not order:
            raise ValueError("Order not found")

        payment = Payment(
            id=None,
            order_id=order_id,
            user_id=user_id,
            amount=order.total,
            method="paypal",
            status=PaymentStatus.PENDING,
            paypal_order_id=None,  # add this
            created_at=datetime.utcnow(),
        )

        # Create PayPal order
        paypal_order = await paypal_service.create_order(order.total)
        paypal_order_id = paypal_order["id"]

        # Save PayPal order ID
        payment.paypal_order_id = paypal_order_id
        saved_payment = await self.payment_repo.create(payment)

        approval_url = next(
            link["href"] for link in paypal_order["links"] if link["rel"] == "approve"
        )

        return {
            "payment_id": saved_payment.id,
            "approval_url": approval_url,
            "paypal_order_id": paypal_order_id,
        }

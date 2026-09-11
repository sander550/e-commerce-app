from http.client import HTTPException

from auth.domain.interfaces.user_repo import IUserRepository
from order.domain.interfaces.order_repo import IOrderRepository
from payment.domain.interfaces.payment_repo import IPaymentRepository



class SendPaymentCompletedEmailUseCase:
    def __init__(
        self,
        user_repo: IUserRepository,
        order_repo: IOrderRepository,
        payment_repo: IPaymentRepository,
        email_queue,   # abstraction for background sending
    ):
        self.user_repo = user_repo
        self.order_repo = order_repo
        self.payment_repo = payment_repo
        self.email_queue = email_queue

    async def execute(self, user_id: int, payment_id: int, order_id: int, amount: float):
        # 1. Load domain objects
        user = await self.user_repo.get_by_id(user_id)
        order = await self.order_repo.get_by_id(order_id)
        payment = await self.payment_repo.get_by_id(payment_id)

        if not user or not order or not payment:
            print("error here", user, order, payment)
            raise HTTPException(status_code=404, detail="Information not available")

        # 2. Build email content
        subject = f"Order Confirmation #{order_id}"
        body = (
            f"Hello user,\n\n"
            f"Your payment of €{amount:.2f} was successful.\n"
            f"Order ID: {order_id}\n"
            f"Items:\n"
        )

        for item in order.items:
            body += f"- {item.name} x {item.quantity}\n"

        body += (
            f"\nShipping to: {order.shipping_address}\n\n"
            f"Thank you for your purchase!"
        )

        # 3. Schedule email sending (NOT send directly)
        await self.email_queue.enqueue(
            email=user.email,
            subject=subject,
            body=body
        )

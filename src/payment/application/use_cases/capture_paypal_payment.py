# payment/application/use_cases/capture_paypal_payment.py
from payment.application.use_cases.complete_payment import CompletePaymentUseCase
from payment.domain.entities.payment import PaymentStatus
from payment.domain.interfaces.payment_repo import IPaymentRepository

class CapturePayPalPaymentUseCase:
    def __init__(
        self,
        paypal_service,
        payment_repo: IPaymentRepository,
        complete_payment_uc: CompletePaymentUseCase
    ):
        self.paypal_service = paypal_service
        self.payment_repo = payment_repo
        self.complete_payment_uc = complete_payment_uc

    async def execute(self, paypal_order_id: str, user_id: int):

        # 1. Capture PayPal payment
        result = await self.paypal_service.capture_order(paypal_order_id)

        # 2. Extract status safely
        status = result.get("status")

        if not status:
            try:
                status = (
                    result["purchase_units"][0]
                    ["payments"]["captures"][0]
                    ["status"]
                )
            except Exception:
                status = None

        # 3. Validate PayPal status
        if status != "COMPLETED":
            raise ValueError(f"Payment not completed. Status was: {status}")

        # 4. Load local payment
        payment = await self.payment_repo.get_by_paypal_order_id(paypal_order_id)
        if not payment:
            raise ValueError("Payment not found")

        # 5. Ownership check
        if payment.user_id != user_id:
            raise PermissionError("Not your payment")

        # 6. Delegate to CompletePaymentUseCase
        updated_payment = await self.complete_payment_uc.execute(
        payment=payment,
        user_id=user_id,
        status=PaymentStatus.SUCCESS
        )
        return updated_payment

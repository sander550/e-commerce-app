from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from payment.application.use_cases.create_paypal_payment import (
    CreatePayPalPaymentUseCase,
)
from payment.application.use_cases.capture_paypal_payment import (
    CapturePayPalPaymentUseCase,
)
from payment.application.use_cases.complete_payment import (
    CompletePaymentUseCase,
)
from payment.domain.entities.payment import PaymentStatus


# ---------------------------------------------------------
# CreatePayPalPaymentUseCase
# ---------------------------------------------------------

@pytest.mark.asyncio
async def test_create_paypal_payment():
    payment_repo = AsyncMock()
    order_repo = AsyncMock()

    order = MagicMock()
    order.total = 49.99

    saved_payment = MagicMock()
    saved_payment.id = 10

    order_repo.get_by_id.return_value = order
    payment_repo.create.return_value = saved_payment

    paypal_order = {
        "id": "PAYPAL123",
        "links": [
            {
                "rel": "approve",
                "href": "https://paypal.com/approve",
            }
        ],
    }

    with patch(
        "payment.application.use_cases.create_paypal_payment.paypal_service"
    ) as paypal_service:

        paypal_service.create_order = AsyncMock(
            return_value=paypal_order
        )

        use_case = CreatePayPalPaymentUseCase(
            payment_repo=payment_repo,
            order_repo=order_repo,
        )

        result = await use_case.execute(
            order_id=1,
            user_id=5,
        )

    assert result == {
        "payment_id": 10,
        "approval_url": "https://paypal.com/approve",
        "paypal_order_id": "PAYPAL123",
    }

    order_repo.get_by_id.assert_awaited_once_with(1)
    paypal_service.create_order.assert_awaited_once_with(49.99)
    payment_repo.create.assert_awaited_once()


# ---------------------------------------------------------
# CapturePayPalPaymentUseCase
# ---------------------------------------------------------

@pytest.mark.asyncio
async def test_capture_paypal_payment():
    paypal_service = AsyncMock()
    payment_repo = AsyncMock()
    complete_payment_uc = AsyncMock()

    payment = MagicMock()
    payment.user_id = 5

    updated_payment = MagicMock()

    paypal_service.capture_order.return_value = {
        "status": "COMPLETED"
    }

    payment_repo.get_by_paypal_order_id.return_value = payment
    complete_payment_uc.execute.return_value = updated_payment

    use_case = CapturePayPalPaymentUseCase(
        paypal_service=paypal_service,
        payment_repo=payment_repo,
        complete_payment_uc=complete_payment_uc,
    )

    result = await use_case.execute(
        paypal_order_id="PAYPAL123",
        user_id=5,
    )

    assert result == updated_payment

    paypal_service.capture_order.assert_awaited_once_with(
        "PAYPAL123"
    )

    payment_repo.get_by_paypal_order_id.assert_awaited_once_with(
        "PAYPAL123"
    )

    complete_payment_uc.execute.assert_awaited_once_with(
        payment=payment,
        user_id=5,
        status=PaymentStatus.SUCCESS,
    )


# ---------------------------------------------------------
# CompletePaymentUseCase
# ---------------------------------------------------------

@pytest.mark.asyncio
async def test_complete_payment():
    payment_repo = AsyncMock()
    cart_repo = AsyncMock()

    payment = MagicMock()
    payment.id = 10
    payment.order_id = 20
    payment.user_id = 5
    payment.amount = 49.99

    payment_repo.update.return_value = payment

    with patch(
        "payment.application.use_cases.complete_payment.event_bus"
    ) as event_bus:

        event_bus.publish = AsyncMock()

        use_case = CompletePaymentUseCase(
            payment_repo=payment_repo,
            cart_repo=cart_repo,
        )

        result = await use_case.execute(
            payment=payment,
            user_id=5,
            status=PaymentStatus.SUCCESS,
        )

    assert result == payment
    assert payment.status == PaymentStatus.SUCCESS

    payment_repo.update.assert_awaited_once_with(payment)

    event_bus.publish.assert_awaited_once()
from unittest.mock import AsyncMock

import pytest

from notifications.application.use_cases.send_payment_completed_email import (
    SendPaymentCompletedEmailUseCase,
)


@pytest.mark.asyncio
async def test_send_payment_completed_email_success():
    user_repo = AsyncMock()
    order_repo = AsyncMock()
    payment_repo = AsyncMock()
    email_queue = AsyncMock()

    user = AsyncMock()
    user.email = "test@example.com"

    item = AsyncMock()
    item.name = "Test Product"
    item.quantity = 2

    order = AsyncMock()
    order.items = [item]
    order.shipping_address = "Test Address"

    payment = AsyncMock()

    user_repo.get_by_id.return_value = user
    order_repo.get_by_id.return_value = order
    payment_repo.get_by_id.return_value = payment

    use_case = SendPaymentCompletedEmailUseCase(
        user_repo=user_repo,
        order_repo=order_repo,
        payment_repo=payment_repo,
        email_queue=email_queue,
    )

    await use_case.execute(
        user_id=1,
        payment_id=2,
        order_id=3,
        amount=25.50,
    )

    email_queue.enqueue.assert_awaited_once_with(
        email="test@example.com",
        subject="Order Confirmation #3",
        body=(
            "Hello user,\n\n"
            "Your payment of €25.50 was successful.\n"
            "Order ID: 3\n"
            "Items:\n"
            "- Test Product x 2\n"
            "\nShipping to: Test Address\n\n"
            "Thank you for your purchase!"
        ),
    )
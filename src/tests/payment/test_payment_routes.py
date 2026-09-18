from unittest.mock import AsyncMock, MagicMock

from fastapi.testclient import TestClient

from main import app

from core.application.use_case_factories.payment_factories import (
    get_create_paypal_payment_use_case,
    get_capture_paypal_payment_use_case,
    get_update_payment_status_use_case,
)
from core.security.dependencies import auth_required
from payment.domain.entities.payment import PaymentStatus

client = TestClient(app)


# ---------------------------------------------------------
# CREATE PAYPAL PAYMENT
# ---------------------------------------------------------

def test_create_paypal_payment():
    use_case = AsyncMock()

    use_case.execute.return_value = {
        "id": "PAYPAL123",
        "status": "created",
    }

    user = MagicMock()
    user.id = 1

    app.dependency_overrides[auth_required] = lambda: user
    app.dependency_overrides[
        get_create_paypal_payment_use_case
    ] = lambda: use_case

    response = client.post(
        "/payment/create",
        json={"order_id": 10},
    )

    assert response.status_code == 200
    assert response.json() == {
        "id": "PAYPAL123",
        "status": "created",
    }

    use_case.execute.assert_awaited_once_with(10, 1)

    app.dependency_overrides = {}


# ---------------------------------------------------------
# CAPTURE PAYPAL PAYMENT
# ---------------------------------------------------------

def test_capture_paypal_payment():
    use_case = AsyncMock()

    result = MagicMock()
    result.to_dict.return_value = {
        "id": 1,
        "status": "completed",
    }

    use_case.execute.return_value = result

    user = MagicMock()
    user.id = 1

    app.dependency_overrides[auth_required] = lambda: user
    app.dependency_overrides[
        get_capture_paypal_payment_use_case
    ] = lambda: use_case

    response = client.get(
        "/payment/success",
        params={"token": "PAYPAL_TOKEN"},
    )

    assert response.status_code == 200
    assert response.json() == {
        "id": 1,
        "status": "completed",
    }

    use_case.execute.assert_awaited_once_with(
        "PAYPAL_TOKEN",
        1,
    )

    app.dependency_overrides = {}


# ---------------------------------------------------------
# CANCEL PAYMENT
# ---------------------------------------------------------

def test_cancel_payment():
    use_case = AsyncMock()

    user = MagicMock()
    user.id = 1

    app.dependency_overrides[auth_required] = lambda: user
    app.dependency_overrides[
        get_update_payment_status_use_case
    ] = lambda: use_case

    response = client.post(
        "/payment/payment/cancel",
        params={"payment_id": 10},
    )

    assert response.status_code == 200
    assert response.json() == {
        "status": "failed",
    }

    use_case.execute.assert_awaited_once_with(
        10,
        1,
        PaymentStatus.FAILED,
    )

    app.dependency_overrides = {}
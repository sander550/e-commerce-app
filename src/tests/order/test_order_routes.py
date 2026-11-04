from datetime import datetime
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi.testclient import TestClient

from main import app
from core.infrastructure.database import get_session
from core.security.dependencies import auth_required
from core.application.use_case_factories.order_factories import (
    get_place_order_use_case,
    get_get_order_details_use_case,
    get_list_user_orders_use_case,
    get_delete_order_use_case,
)


client = TestClient(app)


@pytest.fixture
def mock_user():
    return SimpleNamespace(id=1)


@pytest.fixture(autouse=True)
def override_auth(mock_user):
    app.dependency_overrides[auth_required] = lambda: mock_user
    yield
    app.dependency_overrides = {}


def test_place_order():
    mock_use_case = AsyncMock()
    mock_use_case.execute.return_value = SimpleNamespace(
        id=10,
        user_id=1,
        shipping_address="123 Test Street",
        delivery_method="standard",
        subtotal=100.0,
        tax=20.0,
        total=120.0,
        status="pending",
        created_at=datetime(2026, 1, 1, 12, 0, 0),
        items=[
            SimpleNamespace(
                product_id=5,
                name="Test Product",
                price=50.0,
                quantity=2,
                image_url="https://example.com/image.jpg",
            )
        ],
    )

    app.dependency_overrides[get_place_order_use_case] = lambda: mock_use_case

    response = client.post(
        "/orders/",
        json={
            "shipping_address": "123 Test Street",
            "delivery_method": "standard",
        },
    )

    assert response.status_code == 200
    assert response.json() == {
        "id": 10,
        "user_id": 1,
        "shipping_address": "123 Test Street",
        "delivery_method": "standard",
        "subtotal": 100.0,
        "tax": 20.0,
        "total": 120.0,
        "status": "pending",
        "created_at": "2026-01-01T12:00:00",
        "items": [
            {
                "product_id": 5,
                "name": "Test Product",
                "price": 50.0,
                "quantity": 2,
                "image_url": "https://example.com/image.jpg",
            }
        ],
    }

    mock_use_case.execute.assert_awaited_once_with(
        1, "123 Test Street", "standard"
    )


def test_list_user_orders():
    mock_use_case = AsyncMock()

    mock_order = SimpleNamespace(
        id=10,
        user_id=1,
        shipping_address="123 Test Street",
        delivery_method="standard",
        subtotal=100.0,
        tax=20.0,
        total=120.0,
        status="pending",
        created_at=datetime(2026, 1, 1, 12, 0, 0),
        items=[],
    )

    mock_use_case.execute.return_value = [mock_order]

    app.dependency_overrides[get_list_user_orders_use_case] = (
        lambda: mock_use_case
    )

    response = client.get("/orders/list")

    assert response.status_code == 200
    assert response.json() == [
        {
            "id": 10,
            "user_id": 1,
            "shipping_address": "123 Test Street",
            "delivery_method": "standard",
            "subtotal": 100.0,
            "tax": 20.0,
            "total": 120.0,
            "status": "pending",
            "created_at": "2026-01-01T12:00:00",
            "items": [],
        }
    ]

    mock_use_case.execute.assert_awaited_once_with(1)


def test_get_order_details():
    mock_use_case = AsyncMock()

    mock_order = SimpleNamespace(
        id=10,
        user_id=1,
        shipping_address="123 Test Street",
        delivery_method="standard",
        subtotal=100.0,
        tax=20.0,
        total=120.0,
        status="pending",
        created_at=datetime(2026, 1, 1, 12, 0, 0),
        items=[],
    )

    mock_use_case.execute.return_value = mock_order

    app.dependency_overrides[get_get_order_details_use_case] = (
        lambda: mock_use_case
    )

    response = client.get("/orders/10")

    assert response.status_code == 200
    assert response.json()["id"] == 10
    assert response.json()["user_id"] == 1
    assert response.json()["status"] == "pending"

    mock_use_case.execute.assert_awaited_once_with(1, 10)


def test_delete_order():
    mock_use_case = AsyncMock()
    mock_use_case.execute.return_value = {"message": "Order deleted"}

    app.dependency_overrides[get_delete_order_use_case] = (
        lambda: mock_use_case
    )

    response = client.delete("/orders/10")

    assert response.status_code == 200
    assert response.json() == {"message": "Order deleted"}

    mock_use_case.execute.assert_awaited_once_with(1, 10)


def test_place_order_error():
    mock_use_case = AsyncMock()
    mock_use_case.execute.side_effect = Exception("Could not place order")

    app.dependency_overrides[get_place_order_use_case] = lambda: mock_use_case

    response = client.post(
        "/orders/",
        json={
            "shipping_address": "123 Test Street",
            "delivery_method": "standard",
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Could not place order"


def test_list_user_orders_error():
    mock_use_case = AsyncMock()
    mock_use_case.execute.side_effect = Exception("Could not list orders")

    app.dependency_overrides[get_list_user_orders_use_case] = (
        lambda: mock_use_case
    )

    response = client.get("/orders/list")

    assert response.status_code == 400
    assert response.json()["detail"] == "Could not list orders"


def test_get_order_details_error():
    mock_use_case = AsyncMock()
    mock_use_case.execute.side_effect = Exception("Order not found")

    app.dependency_overrides[get_get_order_details_use_case] = (
        lambda: mock_use_case
    )

    response = client.get("/orders/10")

    assert response.status_code == 400
    assert response.json()["detail"] == "Order not found"


def test_delete_order_error():
    mock_use_case = AsyncMock()
    mock_use_case.execute.side_effect = Exception("Could not delete order")

    app.dependency_overrides[get_delete_order_use_case] = (
        lambda: mock_use_case
    )

    response = client.delete("/orders/10")

    assert response.status_code == 400
    assert response.json()["detail"] == "Could not delete order"


# ---------------------------------------------------------
# REQUEST VALIDATION / AUTH
# ---------------------------------------------------------

def test_place_order_requires_shipping_address_and_delivery_method():
    mock_use_case = AsyncMock()
    app.dependency_overrides[get_place_order_use_case] = lambda: mock_use_case

    response = client.post(
        "/orders/",
        json={"shipping_address": "123 Test Street"},
    )

    assert response.status_code == 422
    mock_use_case.execute.assert_not_awaited()


def test_order_routes_require_authentication():
    # Drop the autouse override so the real auth dependency runs. It only
    # builds repositories (never queries) before rejecting, so a dummy
    # session is enough and no real database is touched.
    app.dependency_overrides.pop(auth_required, None)
    app.dependency_overrides[get_session] = lambda: MagicMock()

    response = client.get("/orders/list")

    assert response.status_code == 401

import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock

from main import app
from cart.routes.cart_routes import router

# Import use case providers
from core.application.use_case_factories.cart_factories import (
    get_cart_use_case,
    get_add_item_use_case,
    get_remove_item_use_case,
    get_update_quantity_use_case,
    get_clear_cart_use_case,
    get_cart_totals_use_case,
)
# Import real auth dependency
from core.security.dependencies import auth_required


# ---------------------------------------------------------
# Fake authenticated user
# ---------------------------------------------------------
def override_auth_required():
    class FakeUser:
        id = 1
    return FakeUser()


# ---------------------------------------------------------
# Test client fixture
# ---------------------------------------------------------
@pytest.fixture
def client():
    app.dependency_overrides.clear()
    app.include_router(router)

    # FIX: override the real dependency
    app.dependency_overrides[auth_required] = override_auth_required

    return TestClient(app)


# ---------------------------------------------------------
# GET CART
# ---------------------------------------------------------
@pytest.mark.asyncio
async def test_get_cart_route(client):
    mock_uc = AsyncMock()
    mock_uc.execute.return_value = type("Cart", (), {
        "user_id": 1,
        "items": [
            type("Item", (), {"product_id": 10, "name": "Item A", "price": 5.0, "quantity": 2, "image_url": None}),
            type("Item", (), {"product_id": 20, "name": "Item B", "price": 10.0, "quantity": 1, "image_url": "img.png"}),
        ]
    })()

    app.dependency_overrides[get_cart_use_case] = lambda: mock_uc

    response = client.get("/cart/")
    assert response.status_code == 200

    data = response.json()
    assert data["user_id"] == 1
    assert data["total_quantity"] == 3
    assert data["total_price"] == 20.0
    assert len(data["items"]) == 2


# ---------------------------------------------------------
# ADD ITEM
# ---------------------------------------------------------
@pytest.mark.asyncio
async def test_add_item_route(client):
    mock_uc = AsyncMock()
    mock_uc.execute.return_value = type("Cart", (), {
        "user_id": 1,
        "items": [
            type("Item", (), {"product_id": 10, "name": "Item A", "price": 5.0, "quantity": 3, "image_url": None})
        ]
    })()

    app.dependency_overrides[get_add_item_use_case] = lambda: mock_uc

    response = client.post("/cart/add", json={"product_id": 10, "quantity": 3})
    assert response.status_code == 200

    data = response.json()
    assert data["total_quantity"] == 3
    assert data["total_price"] == 15.0


# ---------------------------------------------------------
# REMOVE ITEM
# ---------------------------------------------------------
@pytest.mark.asyncio
async def test_remove_item_route(client):
    mock_uc = AsyncMock()
    mock_uc.execute.return_value = type("Cart", (), {
        "user_id": 1,
        "items": []
    })()

    app.dependency_overrides[get_remove_item_use_case] = lambda: mock_uc

    response = client.delete("/cart/item/10")
    assert response.status_code == 200

    data = response.json()
    assert data["items"] == []


# ---------------------------------------------------------
# UPDATE QUANTITY
# ---------------------------------------------------------
@pytest.mark.asyncio
async def test_update_item_quantity_route(client):
    mock_uc = AsyncMock()
    mock_uc.execute.return_value = type("Cart", (), {
        "user_id": 1,
        "items": [
            type("Item", (), {"product_id": 10, "name": "Item A", "price": 5.0, "quantity": 5, "image_url": None})
        ]
    })()

    app.dependency_overrides[get_update_quantity_use_case] = lambda: mock_uc

    response = client.put("/cart/item/10", json={"quantity": 5})
    assert response.status_code == 200

    data = response.json()
    assert data["total_quantity"] == 5
    assert data["total_price"] == 25.0


# ---------------------------------------------------------
# CLEAR CART
# ---------------------------------------------------------
@pytest.mark.asyncio
async def test_clear_cart_route(client):
    mock_uc = AsyncMock()
    mock_uc.execute.return_value = None

    app.dependency_overrides[get_clear_cart_use_case] = lambda: mock_uc

    response = client.post("/cart/clear")
    assert response.status_code == 200
    assert response.json() == {"message": "Cart cleared"}


# ---------------------------------------------------------
# CART TOTALS
# ---------------------------------------------------------
@pytest.mark.asyncio
async def test_cart_totals_route(client):
    mock_uc = AsyncMock()
    mock_uc.execute.return_value = type("Totals", (), {
        "subtotal": 20.0,
        "tax": 4.0,
        "total": 24.0
    })()

    app.dependency_overrides[get_cart_totals_use_case] = lambda: mock_uc

    response = client.get("/cart/totals")
    assert response.status_code == 200

    data = response.json()
    assert data["subtotal"] == 20.0
    assert data["tax"] == 4.0
    assert data["total"] == 24.0

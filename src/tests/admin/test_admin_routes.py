from unittest.mock import AsyncMock

from fastapi.testclient import TestClient

from main import app

from core.application.use_case_factories.admin_factories import (
    get_create_product_use_case,
    get_update_product_use_case,
    get_delete_product_use_case,
    get_create_category_use_case,
    get_update_category_use_case,
    get_delete_category_use_case,
    get_update_order_use_case,
    get_delete_order_use_case,
)

from core.security.dependencies import admin_required


client = TestClient(app)


# ---------------------------------------------------------
# CREATE PRODUCT
# ---------------------------------------------------------

def test_create_product():
    use_case = AsyncMock()

    use_case.execute.return_value = {
        "id": 1,
        "name": "Test Product",
    }

    app.dependency_overrides[admin_required] = lambda: None
    app.dependency_overrides[get_create_product_use_case] = lambda: use_case

    response = client.post(
        "/admin/product",
        json={
            "name": "Test Product",
            "description": "Test description",
            "price": 10.99,
            "stock": 20,
            "category_id": 1,
            "image_url": "image.jpg",
        },
    )

    assert response.status_code == 200
    assert response.json() == {
        "id": 1,
        "name": "Test Product",
    }

    use_case.execute.assert_awaited_once_with(
        name="Test Product",
        description="Test description",
        price=10.99,
        stock=20,
        category_id=1,
        image_url="image.jpg",
    )

    app.dependency_overrides = {}


# ---------------------------------------------------------
# UPDATE PRODUCT
# ---------------------------------------------------------

def test_update_product():
    use_case = AsyncMock()

    use_case.execute.return_value = {
        "id": 1,
        "name": "Updated Product",
    }

    app.dependency_overrides[admin_required] = lambda: None
    app.dependency_overrides[get_update_product_use_case] = lambda: use_case

    response = client.put(
        "/admin/product/1",
        json={
            "name": "Updated Product",
            "description": "Updated description",
            "price": 20.99,
            "stock": 15,
            "category_id": 2,
            "image_url": "new.jpg",
            "is_active": True,
        },
    )

    assert response.status_code == 200
    assert response.json() == {
        "id": 1,
        "name": "Updated Product",
    }

    use_case.execute.assert_awaited_once_with(
        product_id=1,
        name="Updated Product",
        description="Updated description",
        price=20.99,
        stock=15,
        category_id=2,
        image_url="new.jpg",
        is_active=True,
    )

    app.dependency_overrides = {}


# ---------------------------------------------------------
# DELETE PRODUCT
# ---------------------------------------------------------

def test_delete_product():
    use_case = AsyncMock()

    app.dependency_overrides[admin_required] = lambda: None
    app.dependency_overrides[get_delete_product_use_case] = lambda: use_case

    response = client.delete("/admin/product/1")

    assert response.status_code == 200
    assert response.json() == {
        "status": "deleted"
    }

    use_case.execute.assert_awaited_once_with(1)

    app.dependency_overrides = {}


# ---------------------------------------------------------
# CREATE CATEGORY
# ---------------------------------------------------------

def test_create_category():
    use_case = AsyncMock()

    use_case.execute.return_value = {
        "id": 1,
        "name": "Electronics",
    }

    app.dependency_overrides[admin_required] = lambda: None
    app.dependency_overrides[get_create_category_use_case] = lambda: use_case

    response = client.post(
        "/admin/category",
        json={
            "name": "Electronics",
            "parent_id": None,
        },
    )

    assert response.status_code == 200
    assert response.json() == {
        "id": 1,
        "name": "Electronics",
    }

    use_case.execute.assert_awaited_once_with(
        name="Electronics",
        parent_id=None,
    )

    app.dependency_overrides = {}


# ---------------------------------------------------------
# UPDATE CATEGORY
# ---------------------------------------------------------

def test_update_category():
    use_case = AsyncMock()

    use_case.execute.return_value = {
        "id": 1,
        "name": "Updated Category",
    }

    app.dependency_overrides[admin_required] = lambda: None
    app.dependency_overrides[get_update_category_use_case] = lambda: use_case

    response = client.put(
        "/admin/category/1",
        json={
            "name": "Updated Category",
            "parent_id": None,
        },
    )

    assert response.status_code == 200
    assert response.json() == {
        "id": 1,
        "name": "Updated Category",
    }

    use_case.execute.assert_awaited_once_with(
        category_id=1,
        name="Updated Category",
        parent_id=None,
    )

    app.dependency_overrides = {}


# ---------------------------------------------------------
# DELETE CATEGORY
# ---------------------------------------------------------

def test_delete_category():
    use_case = AsyncMock()

    app.dependency_overrides[admin_required] = lambda: None
    app.dependency_overrides[get_delete_category_use_case] = lambda: use_case

    response = client.delete("/admin/category/1")

    assert response.status_code == 200
    assert response.json() == {
        "status": "deleted"
    }

    use_case.execute.assert_awaited_once_with(1)

    app.dependency_overrides = {}


# ---------------------------------------------------------
# UPDATE ORDER
# ---------------------------------------------------------

def test_update_order():
    use_case = AsyncMock()

    use_case.execute.return_value = {
        "id": 1,
        "status": "shipped",
    }

    app.dependency_overrides[admin_required] = lambda: None
    app.dependency_overrides[get_update_order_use_case] = lambda: use_case

    response = client.put(
        "/admin/order/1",
        json={
            "status": "shipped",
            "shipping_address": "Test Address",
            "delivery_method": "delivery",
        },
    )

    assert response.status_code == 200
    assert response.json() == {
        "id": 1,
        "status": "shipped",
    }

    use_case.execute.assert_awaited_once_with(
        order_id=1,
        status="shipped",
        shipping_address="Test Address",
        delivery_method="delivery",
    )

    app.dependency_overrides = {}


# ---------------------------------------------------------
# DELETE ORDER
# ---------------------------------------------------------

def test_delete_order():
    use_case = AsyncMock()

    app.dependency_overrides[admin_required] = lambda: None
    app.dependency_overrides[get_delete_order_use_case] = lambda: use_case

    response = client.delete("/admin/order/1")

    assert response.status_code == 200
    assert response.json() == {
        "status": "deleted"
    }

    use_case.execute.assert_awaited_once_with(1)

    app.dependency_overrides = {}
from unittest.mock import AsyncMock

from fastapi.testclient import TestClient

from main import app

from core.application.use_case_factories.catalog_factories import (
    get_list_products_use_case,
    get_product_details_use_case,
    get_products_by_category_use_case,
    get_list_categories_use_case,
)

from catalog.domain.entities.product import Product
from catalog.domain.entities.category import Category


client = TestClient(app)


def mock_product():
    return Product(
        id=1,
        name="Laptop",
        description="Gaming laptop",
        price=999.99,
        stock=10,
        category_id=1,
        image_url="https://example.com/laptop.jpg",
        is_active=True,
    )


def mock_category():
    return Category(
        id=1,
        name="Electronics",
        parent_id=None,
    )


# ---------------- LIST PRODUCTS ----------------

def test_list_products_success():
    mock = AsyncMock()
    mock.execute.return_value = [
        mock_product(),
    ]

    app.dependency_overrides[get_list_products_use_case] = lambda: mock

    response = client.get("/products/")

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 1
    assert data[0]["id"] == 1
    assert data[0]["name"] == "Laptop"
    assert data[0]["description"] == "Gaming laptop"
    assert data[0]["price"] == 999.99
    assert data[0]["stock"] == 10
    assert data[0]["category_id"] == 1
    assert data[0]["image_url"] == "https://example.com/laptop.jpg"
    assert data[0]["is_active"] is True

    mock.execute.assert_awaited_once()

    app.dependency_overrides = {}


def test_list_products_empty():
    mock = AsyncMock()
    mock.execute.return_value = []

    app.dependency_overrides[get_list_products_use_case] = lambda: mock

    response = client.get("/products/")

    assert response.status_code == 200
    assert response.json() == []

    mock.execute.assert_awaited_once()

    app.dependency_overrides = {}


def test_list_products_error():
    mock = AsyncMock()
    mock.execute.side_effect = Exception("Database error")

    app.dependency_overrides[get_list_products_use_case] = lambda: mock

    response = client.get("/products/")

    assert response.status_code == 500
    assert response.json()["detail"] == "Database error"

    mock.execute.assert_awaited_once()

    app.dependency_overrides = {}


# ---------------- GET PRODUCT DETAILS ----------------

def test_get_product_details_success():
    mock = AsyncMock()
    mock.execute.return_value = mock_product()

    app.dependency_overrides[get_product_details_use_case] = lambda: mock

    response = client.get("/products/1")

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == 1
    assert data["name"] == "Laptop"
    assert data["description"] == "Gaming laptop"
    assert data["price"] == 999.99
    assert data["stock"] == 10
    assert data["category_id"] == 1

    mock.execute.assert_awaited_once_with(1)

    app.dependency_overrides = {}


def test_get_product_details_not_found():
    mock = AsyncMock()
    mock.execute.side_effect = ValueError("Product not found")

    app.dependency_overrides[get_product_details_use_case] = lambda: mock

    response = client.get("/products/999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Product not found"

    mock.execute.assert_awaited_once_with(999)

    app.dependency_overrides = {}


# ---------------- PRODUCTS BY CATEGORY ----------------

def test_list_products_by_category_success():
    product1 = mock_product()

    product2 = Product(
        id=2,
        name="Keyboard",
        description="Mechanical keyboard",
        price=99.99,
        stock=20,
        category_id=1,
        image_url=None,
        is_active=True,
    )

    mock = AsyncMock()
    mock.execute.return_value = [
        product1,
        product2,
    ]

    app.dependency_overrides[
        get_products_by_category_use_case
    ] = lambda: mock

    response = client.get("/products/category/1")

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 2

    assert data[0]["id"] == 1
    assert data[0]["name"] == "Laptop"
    assert data[0]["category_id"] == 1

    assert data[1]["id"] == 2
    assert data[1]["name"] == "Keyboard"
    assert data[1]["category_id"] == 1

    mock.execute.assert_awaited_once_with(1)

    app.dependency_overrides = {}


def test_list_products_by_category_empty():
    mock = AsyncMock()
    mock.execute.return_value = []

    app.dependency_overrides[
        get_products_by_category_use_case
    ] = lambda: mock

    response = client.get("/products/category/1")

    assert response.status_code == 200
    assert response.json() == []

    mock.execute.assert_awaited_once_with(1)

    app.dependency_overrides = {}


def test_list_products_by_category_not_found():
    mock = AsyncMock()
    mock.execute.side_effect = ValueError("Category not found")

    app.dependency_overrides[
        get_products_by_category_use_case
    ] = lambda: mock

    response = client.get("/products/category/999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Category not found"

    mock.execute.assert_awaited_once_with(999)

    app.dependency_overrides = {}


# ---------------- LIST CATEGORIES ----------------

def test_list_categories_success():
    mock = AsyncMock()
    mock.execute.return_value = [
        mock_category(),
    ]

    app.dependency_overrides[get_list_categories_use_case] = lambda: mock

    response = client.get("/categories/")

    assert response.status_code == 200

    data = response.json()

    assert "categories" in data
    assert len(data["categories"]) == 1

    assert data["categories"][0]["id"] == 1
    assert data["categories"][0]["name"] == "Electronics"
    assert data["categories"][0]["parent_id"] is None

    mock.execute.assert_awaited_once()

    app.dependency_overrides = {}


def test_list_categories_empty():
    mock = AsyncMock()
    mock.execute.return_value = []

    app.dependency_overrides[get_list_categories_use_case] = lambda: mock

    response = client.get("/categories/")

    assert response.status_code == 200
    assert response.json() == {
        "categories": []
    }

    mock.execute.assert_awaited_once()

    app.dependency_overrides = {}


def test_list_categories_error():
    mock = AsyncMock()
    mock.execute.side_effect = Exception("Database error")

    app.dependency_overrides[get_list_categories_use_case] = lambda: mock

    response = client.get("/categories/")

    assert response.status_code == 200
    assert response.json() == {
        "error": "Database error"
    }

    mock.execute.assert_awaited_once()

    app.dependency_overrides = {}
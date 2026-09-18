from unittest.mock import AsyncMock

import pytest

from catalog.application.use_cases.get_product_details import (
    GetProductDetailsUseCase,
)
from catalog.application.use_cases.get_products_by_category import (
    GetProductsByCategoryUseCase,
)
from catalog.application.use_cases.list_categories import (
    ListCategoriesUseCase,
)
from catalog.application.use_cases.list_products import (
    ListProductsUseCase,
)
from catalog.application.use_cases.update_stock import (
    UpdateStockUseCase,
)

from catalog.domain.entities.product import Product
from catalog.domain.entities.category import Category


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


# =========================================================
# GET PRODUCT DETAILS
# =========================================================

@pytest.mark.asyncio
async def test_get_product_details_success():
    product_repo = AsyncMock()
    category_repo = AsyncMock()

    product = mock_product()
    category = mock_category()

    product_repo.get_by_id.return_value = product
    category_repo.get_by_id.return_value = category

    use_case = GetProductDetailsUseCase(
        product_repo=product_repo,
        category_repo=category_repo,
    )

    result = await use_case.execute(1)

    assert result == product
    assert result.category == category

    product_repo.get_by_id.assert_awaited_once_with(1)
    category_repo.get_by_id.assert_awaited_once_with(1)


@pytest.mark.asyncio
async def test_get_product_details_product_not_found():
    product_repo = AsyncMock()
    category_repo = AsyncMock()

    product_repo.get_by_id.return_value = None

    use_case = GetProductDetailsUseCase(
        product_repo=product_repo,
        category_repo=category_repo,
    )

    with pytest.raises(ValueError, match="Product not found"):
        await use_case.execute(999)

    product_repo.get_by_id.assert_awaited_once_with(999)
    category_repo.get_by_id.assert_not_awaited()


@pytest.mark.asyncio
async def test_get_product_details_category_not_found():
    product_repo = AsyncMock()
    category_repo = AsyncMock()

    product = mock_product()

    product_repo.get_by_id.return_value = product
    category_repo.get_by_id.return_value = None

    use_case = GetProductDetailsUseCase(
        product_repo=product_repo,
        category_repo=category_repo,
    )

    with pytest.raises(ValueError, match="Category not found"):
        await use_case.execute(1)

    product_repo.get_by_id.assert_awaited_once_with(1)
    category_repo.get_by_id.assert_awaited_once_with(
        product.category_id
    )


# =========================================================
# GET PRODUCTS BY CATEGORY
# =========================================================

@pytest.mark.asyncio
async def test_get_products_by_category_success():
    product_repo = AsyncMock()
    category_repo = AsyncMock()

    products = [
        mock_product(),
        Product(
            id=2,
            name="Keyboard",
            description="Mechanical keyboard",
            price=99.99,
            stock=20,
            category_id=1,
            image_url=None,
            is_active=True,
        ),
    ]

    product_repo.list_by_category.return_value = products

    use_case = GetProductsByCategoryUseCase(
        product_repo=product_repo,
        category_repo=category_repo,
    )

    result = await use_case.execute(1)

    assert result == products
    assert len(result) == 2

    product_repo.list_by_category.assert_awaited_once_with(1)


@pytest.mark.asyncio
async def test_get_products_by_category_empty():
    product_repo = AsyncMock()
    category_repo = AsyncMock()

    product_repo.list_by_category.return_value = []

    use_case = GetProductsByCategoryUseCase(
        product_repo=product_repo,
        category_repo=category_repo,
    )

    result = await use_case.execute(1)

    assert result == []

    product_repo.list_by_category.assert_awaited_once_with(1)


# =========================================================
# LIST CATEGORIES
# =========================================================

@pytest.mark.asyncio
async def test_list_categories_success():
    category_repo = AsyncMock()

    categories = [
        mock_category(),
        Category(
            id=2,
            name="Computers",
            parent_id=1,
        ),
    ]

    category_repo.list.return_value = categories

    use_case = ListCategoriesUseCase(
        category_repo=category_repo,
    )

    result = await use_case.execute()

    assert result == categories
    assert len(result) == 2
    assert result[0].name == "Electronics"
    assert result[1].name == "Computers"

    category_repo.list.assert_awaited_once()


@pytest.mark.asyncio
async def test_list_categories_empty():
    category_repo = AsyncMock()

    category_repo.list.return_value = []

    use_case = ListCategoriesUseCase(
        category_repo=category_repo,
    )

    result = await use_case.execute()

    assert result == []

    category_repo.list.assert_awaited_once()


# =========================================================
# LIST PRODUCTS
# =========================================================

@pytest.mark.asyncio
async def test_list_products_success():
    product_repo = AsyncMock()

    products = [
        mock_product(),
        Product(
            id=2,
            name="Keyboard",
            description="Mechanical keyboard",
            price=99.99,
            stock=20,
            category_id=1,
            image_url=None,
            is_active=True,
        ),
    ]

    product_repo.list.return_value = products

    use_case = ListProductsUseCase(
        product_repo=product_repo,
    )

    result = await use_case.execute()

    assert result == products
    assert len(result) == 2
    assert result[0].name == "Laptop"
    assert result[1].name == "Keyboard"

    product_repo.list.assert_awaited_once()


@pytest.mark.asyncio
async def test_list_products_empty():
    product_repo = AsyncMock()

    product_repo.list.return_value = []

    use_case = ListProductsUseCase(
        product_repo=product_repo,
    )

    result = await use_case.execute()

    assert result == []

    product_repo.list.assert_awaited_once()


# =========================================================
# UPDATE STOCK
# =========================================================

@pytest.mark.asyncio
async def test_update_stock_success():
    order_repo = AsyncMock()
    product_repo = AsyncMock()

    product = mock_product()
    product.stock = 10

    order_item = AsyncMock()
    order_item.product_id = 1
    order_item.quantity = 3

    order = AsyncMock()
    order.items = [order_item]

    order_repo.get_by_id.return_value = order
    product_repo.get_by_id.return_value = product

    use_case = UpdateStockUseCase(
        order_repo=order_repo,
        product_repo=product_repo,
    )

    result = await use_case.execute(1)

    assert result is None
    assert product.stock == 7

    order_repo.get_by_id.assert_awaited_once_with(1)
    product_repo.get_by_id.assert_awaited_once_with(1)
    product_repo.update.assert_awaited_once_with(product)


@pytest.mark.asyncio
async def test_update_stock_order_not_found():
    order_repo = AsyncMock()
    product_repo = AsyncMock()

    order_repo.get_by_id.return_value = None

    use_case = UpdateStockUseCase(
        order_repo=order_repo,
        product_repo=product_repo,
    )

    with pytest.raises(ValueError, match="Order not found"):
        await use_case.execute(999)

    order_repo.get_by_id.assert_awaited_once_with(999)
    product_repo.get_by_id.assert_not_awaited()
    product_repo.update.assert_not_awaited()


@pytest.mark.asyncio
async def test_update_stock_product_not_found():
    order_repo = AsyncMock()
    product_repo = AsyncMock()

    order_item = AsyncMock()
    order_item.product_id = 999
    order_item.quantity = 2

    order = AsyncMock()
    order.items = [order_item]

    order_repo.get_by_id.return_value = order
    product_repo.get_by_id.return_value = None

    use_case = UpdateStockUseCase(
        order_repo=order_repo,
        product_repo=product_repo,
    )

    with pytest.raises(ValueError, match="Product not found"):
        await use_case.execute(1)

    order_repo.get_by_id.assert_awaited_once_with(1)
    product_repo.get_by_id.assert_awaited_once_with(999)
    product_repo.update.assert_not_awaited()


@pytest.mark.asyncio
async def test_update_stock_never_goes_below_zero():
    order_repo = AsyncMock()
    product_repo = AsyncMock()

    product = mock_product()
    product.stock = 2

    order_item = AsyncMock()
    order_item.product_id = 1
    order_item.quantity = 10

    order = AsyncMock()
    order.items = [order_item]

    order_repo.get_by_id.return_value = order
    product_repo.get_by_id.return_value = product

    use_case = UpdateStockUseCase(
        order_repo=order_repo,
        product_repo=product_repo,
    )

    await use_case.execute(1)

    assert product.stock == 0

    product_repo.update.assert_awaited_once_with(product)


@pytest.mark.asyncio
async def test_update_stock_multiple_items():
    order_repo = AsyncMock()
    product_repo = AsyncMock()

    product1 = mock_product()
    product1.stock = 10

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

    item1 = AsyncMock()
    item1.product_id = 1
    item1.quantity = 3

    item2 = AsyncMock()
    item2.product_id = 2
    item2.quantity = 5

    order = AsyncMock()
    order.items = [item1, item2]

    order_repo.get_by_id.return_value = order

    async def get_product(product_id):
        if product_id == 1:
            return product1
        if product_id == 2:
            return product2
        return None

    product_repo.get_by_id.side_effect = get_product

    use_case = UpdateStockUseCase(
        order_repo=order_repo,
        product_repo=product_repo,
    )

    await use_case.execute(1)

    assert product1.stock == 7
    assert product2.stock == 15

    assert product_repo.get_by_id.await_count == 2
    assert product_repo.update.await_count == 2
import pytest
from unittest.mock import AsyncMock, MagicMock

from admin.application.use_cases.create_category import CreateCategoryUseCase
from admin.application.use_cases.create_product import CreateProductUseCase
from admin.application.use_cases.delete_category import DeleteCategoryUseCase
from admin.application.use_cases.delete_order import DeleteOrderUseCase
from admin.application.use_cases.delete_product import DeleteProductUseCase
from admin.application.use_cases.update_category import UpdateCategoryUseCase
from admin.application.use_cases.update_order import UpdateOrderUseCase
from admin.application.use_cases.update_product import UpdateProductUseCase


@pytest.mark.asyncio
async def test_create_category():
    category_repo = AsyncMock()

    category = MagicMock()
    category.id = 1
    category.name = "Electronics"
    category.parent_id = None

    category_repo.create.return_value = category

    use_case = CreateCategoryUseCase(category_repo)

    result = await use_case.execute(
        name="Electronics",
        parent_id=None,
    )

    assert result == category
    category_repo.create.assert_awaited_once_with(
        name="Electronics",
        parent_id=None,
    )


@pytest.mark.asyncio
async def test_create_product():
    product_repo = AsyncMock()
    category_repo = AsyncMock()
    embedding_service = AsyncMock()
    vector_store = AsyncMock()

    category = MagicMock()
    category.id = 1
    category.name = "Electronics"

    created_product = MagicMock()
    created_product.id = 10
    created_product.name = "Laptop"
    created_product.description = "Gaming laptop"
    created_product.price = 999.99
    created_product.stock = 5

    category_repo.get_by_id.return_value = category
    product_repo.create.return_value = created_product
    embedding_service.embed.return_value = [0.1, 0.2, 0.3]

    use_case = CreateProductUseCase(
        product_repo=product_repo,
        category_repo=category_repo,
        embedding_service=embedding_service,
        vector_store=vector_store,
    )

    result = await use_case.execute(
        name="Laptop",
        description="Gaming laptop",
        price=999.99,
        stock=5,
        category_id=1,
        image_url=None,
    )

    assert result == created_product
    category_repo.get_by_id.assert_awaited_once_with(1)
    product_repo.create.assert_awaited_once()
    embedding_service.embed.assert_awaited_once()
    vector_store.add.assert_awaited_once_with(
        10,
        [0.1, 0.2, 0.3],
    )


@pytest.mark.asyncio
async def test_delete_category():
    category_repo = AsyncMock()

    category = MagicMock()
    category.id = 1

    category_repo.get_by_id.return_value = category

    use_case = DeleteCategoryUseCase(category_repo)

    result = await use_case.execute(1)

    assert result is None
    category_repo.get_by_id.assert_awaited_once_with(1)
    category_repo.delete.assert_awaited_once_with(1)


@pytest.mark.asyncio
async def test_delete_order():
    order_repo = AsyncMock()

    order = MagicMock()
    order.id = 1

    order_repo.get_by_id.return_value = order

    use_case = DeleteOrderUseCase(order_repo)

    result = await use_case.execute(1)

    assert result is None
    order_repo.get_by_id.assert_awaited_once_with(1)
    order_repo.delete.assert_awaited_once_with(1)


@pytest.mark.asyncio
async def test_delete_product():
    product_repo = AsyncMock()
    vector_store = AsyncMock()

    product = MagicMock()
    product.id = 1

    product_repo.get_by_id.return_value = product

    use_case = DeleteProductUseCase(
        product_repo=product_repo,
        vector_store=vector_store,
    )

    result = await use_case.execute(1)

    assert result is None
    product_repo.get_by_id.assert_awaited_once_with(1)
    product_repo.delete.assert_awaited_once_with(1)
    vector_store.delete.assert_awaited_once_with(1)


@pytest.mark.asyncio
async def test_update_category():
    category_repo = AsyncMock()

    existing = MagicMock()
    existing.id = 1
    existing.name = "Old"
    existing.parent_id = None

    updated = MagicMock()
    updated.id = 1
    updated.name = "New"
    updated.parent_id = None

    category_repo.get_by_id.return_value = existing
    category_repo.update.return_value = updated

    use_case = UpdateCategoryUseCase(category_repo)

    result = await use_case.execute(
        category_id=1,
        name="New",
        parent_id=None,
    )

    assert result == updated
    category_repo.get_by_id.assert_awaited_once_with(1)
    category_repo.update.assert_awaited_once_with(
        category_id=1,
        name="New",
        parent_id=None,
    )


@pytest.mark.asyncio
async def test_update_order():
    order_repo = AsyncMock()

    existing = MagicMock()
    existing.id = 1
    existing.user_id = 5
    existing.items = []
    existing.subtotal = 100
    existing.tax = 20
    existing.total = 120
    existing.created_at = None

    updated = MagicMock()
    updated.id = 1
    updated.status = "shipped"

    order_repo.get_by_id.return_value = existing
    order_repo.save.return_value = updated

    use_case = UpdateOrderUseCase(order_repo)

    result = await use_case.execute(
        order_id=1,
        status="shipped",
        shipping_address="Test Street",
        delivery_method="standard",
    )

    assert result == updated
    order_repo.get_by_id.assert_awaited_once_with(1)
    order_repo.save.assert_awaited_once()


@pytest.mark.asyncio
async def test_update_product():
    product_repo = AsyncMock()
    category_repo = AsyncMock()
    embedding_service = AsyncMock()
    vector_store = AsyncMock()

    existing = MagicMock()
    existing.id = 1
    existing.name = "Old Laptop"
    existing.description = "Old description"
    existing.price = 500
    existing.stock = 10
    existing.category_id = 1
    existing.image_url = None
    existing.is_active = True

    updated = MagicMock()
    updated.id = 1
    updated.name = "New Laptop"
    updated.description = "New description"

    product_repo.get_by_id.return_value = existing
    product_repo.update.return_value = updated
    embedding_service.embed.return_value = [0.1, 0.2, 0.3]

    use_case = UpdateProductUseCase(
        product_repo=product_repo,
        category_repo=category_repo,
        embedding_service=embedding_service,
        vector_store=vector_store,
    )

    result = await use_case.execute(
        product_id=1,
        name="New Laptop",
        description="New description",
    )

    assert result == updated
    product_repo.get_by_id.assert_awaited_once_with(1)
    product_repo.update.assert_awaited_once()
    embedding_service.embed.assert_awaited_once()
    vector_store.upsert.assert_awaited_once_with(
        1,
        [0.1, 0.2, 0.3],
    )


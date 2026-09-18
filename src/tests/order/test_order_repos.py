from unittest.mock import AsyncMock, MagicMock

import pytest

from order.infrastructure.repositories.order_repo_impl import OrderRepository
from order.infrastructure.db.order_model import OrderModel


def test_to_domain():
    session = AsyncMock()
    repo = OrderRepository(session)

    item = MagicMock()
    item.product_id = 1
    item.name = "Product"
    item.price = 10
    item.quantity = 2
    item.image_url = "image.jpg"

    model = MagicMock()
    model.id = 1
    model.user_id = 5
    model.shipping_address = "Test address"
    model.delivery_method = "delivery"
    model.subtotal = 20
    model.tax = 4
    model.total = 24
    model.status = "pending"
    model.items = [item]
    model.created_at = None

    result = repo._to_domain(model)

    assert result.id == 1
    assert result.user_id == 5
    assert result.shipping_address == "Test address"
    assert result.delivery_method == "delivery"
    assert result.subtotal == 20
    assert result.tax == 4
    assert result.total == 24
    assert result.status == "pending"
    assert len(result.items) == 1
    assert result.items[0].product_id == 1
    assert result.items[0].name == "Product"


@pytest.mark.asyncio
async def test_save():
    session = AsyncMock()
    repo = OrderRepository(session)

    order = MagicMock()
    order.id = None
    order.user_id = 1
    order.subtotal = 20
    order.tax = 4
    order.total = 24
    order.status = "pending"
    order.shipping_address = "Test address"
    order.delivery_method = "delivery"
    order.items = []

    db_order = MagicMock()
    db_order.id = 1
    db_order.user_id = 1
    db_order.shipping_address = "Test address"
    db_order.delivery_method = "delivery"
    db_order.subtotal = 20
    db_order.tax = 4
    db_order.total = 24
    db_order.status = "pending"
    db_order.items = []
    db_order.created_at = None

    # flush gives the new OrderModel an ID
    async def flush():
        session.add.call_args.args[0].id = 1

    session.flush.side_effect = flush

    # execute() is async, but its result is synchronous
    execute_result = MagicMock()
    execute_result.scalar_one.return_value = db_order
    session.execute.return_value = execute_result

    result = await repo.save(order)

    assert result.id == 1
    assert result.user_id == 1
    session.add.assert_called()
    session.flush.assert_awaited_once()
    session.commit.assert_awaited_once()
    assert session.execute.await_count == 1


@pytest.mark.asyncio
async def test_get_by_id():
    session = AsyncMock()
    repo = OrderRepository(session)

    model = MagicMock(spec=OrderModel)
    model.id = 1
    model.user_id = 2
    model.shipping_address = "Address"
    model.delivery_method = "delivery"
    model.subtotal = 20
    model.tax = 4
    model.total = 24
    model.status = "pending"
    model.items = []
    model.created_at = None

    execute_result = MagicMock()
    execute_result.scalar_one_or_none.return_value = model
    session.execute.return_value = execute_result

    result = await repo.get_by_id(1)

    assert result.id == 1
    assert result.user_id == 2


@pytest.mark.asyncio
async def test_list_by_user_id():
    session = AsyncMock()
    repo = OrderRepository(session)

    model = MagicMock()
    model.id = 1
    model.user_id = 5
    model.shipping_address = "Address"
    model.delivery_method = "delivery"
    model.subtotal = 20
    model.tax = 4
    model.total = 24
    model.status = "pending"
    model.items = []
    model.created_at = None

    execute_result = MagicMock()
    execute_result.scalars.return_value.all.return_value = [model]
    session.execute.return_value = execute_result

    result = await repo.list_by_user_id(5)

    assert len(result) == 1
    assert result[0].id == 1
    assert result[0].user_id == 5


@pytest.mark.asyncio
async def test_get_model_by_id():
    session = AsyncMock()
    repo = OrderRepository(session)

    model = MagicMock(spec=OrderModel)
    model.id = 1

    execute_result = MagicMock()
    execute_result.scalar_one_or_none.return_value = model
    session.execute.return_value = execute_result

    result = await repo.get_model_by_id(1)

    assert result == model


@pytest.mark.asyncio
async def test_delete():
    session = AsyncMock()
    repo = OrderRepository(session)

    await repo.delete(1)

    assert session.execute.await_count == 2
    session.commit.assert_awaited_once()


@pytest.mark.asyncio
async def test_get_last_order_for_user():
    session = AsyncMock()
    repo = OrderRepository(session)

    order1 = MagicMock()
    order2 = MagicMock()

    repo.list_by_user_id = AsyncMock(
        return_value=[order1, order2]
    )

    result = await repo.get_last_order_for_user(1)

    assert result == order2


@pytest.mark.asyncio
async def test_find_duplicate_order():
    session = AsyncMock()
    repo = OrderRepository(session)

    item1 = MagicMock()
    item1.product_id = 1
    item1.quantity = 2
    item1.price = 10

    item2 = MagicMock()
    item2.product_id = 1
    item2.quantity = 2
    item2.price = 10

    last_order = MagicMock()
    last_order.items = [item1]

    repo.get_last_order_for_user = AsyncMock(
        return_value=last_order
    )

    result = await repo.find_duplicate_order(1, [item2])

    assert result == last_order
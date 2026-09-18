from unittest.mock import AsyncMock, MagicMock

import pytest

from order.application.use_cases.delete_order import DeleteOrderUseCase
from order.application.use_cases.get_order_details import GetOrderDetailsUseCase
from order.application.use_cases.list_user_orders import ListUserOrdersUseCase
from order.application.use_cases.mark_order_paid import MarkOrderPaidUseCase
from order.application.use_cases.place_order import PlaceOrderUseCase


# ---------------------------------------------------------
# DeleteOrderUseCase
# ---------------------------------------------------------

@pytest.mark.asyncio
async def test_delete_order():
    order_repo = AsyncMock()

    order = MagicMock()
    order.user_id = 1

    order_repo.get_by_id.return_value = order

    use_case = DeleteOrderUseCase(order_repo)

    result = await use_case.execute(
        user_id=1,
        order_id=10,
    )

    assert result is True
    order_repo.get_by_id.assert_awaited_once_with(10)
    order_repo.delete.assert_awaited_once_with(10)


# ---------------------------------------------------------
# GetOrderDetailsUseCase
# ---------------------------------------------------------

@pytest.mark.asyncio
async def test_get_order_details():
    order_repo = AsyncMock()

    order = MagicMock()
    order.user_id = 1

    order_repo.get_by_id.return_value = order

    use_case = GetOrderDetailsUseCase(order_repo)

    result = await use_case.execute(
        user_id=1,
        order_id=10,
    )

    assert result == order
    order_repo.get_by_id.assert_awaited_once_with(10)


# ---------------------------------------------------------
# ListUserOrdersUseCase
# ---------------------------------------------------------

@pytest.mark.asyncio
async def test_list_user_orders():
    order_repo = AsyncMock()

    order1 = MagicMock()
    order2 = MagicMock()

    order_repo.list_by_user_id.return_value = [
        order1,
        order2,
    ]

    use_case = ListUserOrdersUseCase(order_repo)

    result = await use_case.execute(user_id=1)

    assert result == [order1, order2]
    order_repo.list_by_user_id.assert_awaited_once_with(1)


# ---------------------------------------------------------
# MarkOrderPaidUseCase
# ---------------------------------------------------------

@pytest.mark.asyncio
async def test_mark_order_paid():
    order_repo = AsyncMock()

    order = MagicMock()
    order.status = "pending"

    saved_order = MagicMock()

    order_repo.get_by_id.return_value = order
    order_repo.save.return_value = saved_order

    use_case = MarkOrderPaidUseCase(order_repo)

    result = await use_case.execute(order_id=10)

    assert order.status == "paid"
    assert result == saved_order

    order_repo.get_by_id.assert_awaited_once_with(10)
    order_repo.save.assert_awaited_once_with(order)


# ---------------------------------------------------------
# PlaceOrderUseCase
# ---------------------------------------------------------

@pytest.mark.asyncio
async def test_place_order():
    cart_repo = AsyncMock()
    order_repo = AsyncMock()
    product_repo = AsyncMock()

    cart_item = MagicMock()
    cart_item.product_id = 1
    cart_item.name = "Test Product"
    cart_item.price = 10
    cart_item.quantity = 2
    cart_item.image_url = "image.jpg"

    cart = MagicMock()
    cart.items = [cart_item]

    product = MagicMock()
    product.id = 1
    product.stock = 10

    saved_order = MagicMock()

    cart_repo.get_by_user_id.return_value = cart
    product_repo.get_by_id.return_value = product
    cart_repo.save.return_value = cart
    order_repo.save.return_value = saved_order

    use_case = PlaceOrderUseCase(
        cart_repo=cart_repo,
        order_repo=order_repo,
        product_repo=product_repo,
    )

    result = await use_case.execute(
        user_id=1,
        shipping_address="Test Address",
        delivery_method="delivery",
    )

    assert result == saved_order

    cart_repo.get_by_user_id.assert_awaited_once_with(1)
    cart_repo.save.assert_awaited_once_with(cart)

    assert order_repo.save.await_count == 1
    saved_order_arg = order_repo.save.call_args.args[0]

    assert saved_order_arg.user_id == 1
    assert saved_order_arg.shipping_address == "Test Address"
    assert saved_order_arg.delivery_method == "delivery"
    assert saved_order_arg.status == "pending"
    assert len(saved_order_arg.items) == 1
    assert saved_order_arg.items[0].product_id == 1
    assert saved_order_arg.items[0].quantity == 2

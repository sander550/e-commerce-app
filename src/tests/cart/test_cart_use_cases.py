import pytest
from unittest.mock import AsyncMock

from cart.application.use_cases.add_item_to_cart import AddItemToCartUseCase
from cart.application.use_cases.calculate_cart_totals import CalculateCartTotalsUseCase
from cart.application.use_cases.clear_cart import ClearCartUseCase
from cart.application.use_cases.get_cart import GetCartUseCase
from cart.application.use_cases.remove_cart_item import RemoveCartItemUseCase
from cart.application.use_cases.update_cart_item_quantity import UpdateCartItemQuantityUseCase

from cart.domain.entities.cart import Cart, CartItem
from cart.domain.entities.cart_totals import CartTotals


# ---------------------------------------------------------
# ADD ITEM
# ---------------------------------------------------------
@pytest.mark.asyncio
async def test_add_item_to_cart_new_item():
    cart_repo = AsyncMock()
    product_repo = AsyncMock()

    product_repo.get_by_id.return_value = type("Product", (), {
        "id": 10,
        "name": "Item A",
        "price": 5.0,
        "stock": 10,
        "image_url": None
    })()

    cart_repo.get_by_user_id.return_value = Cart(user_id=1, items=[])

    uc = AddItemToCartUseCase(cart_repo, product_repo)

    cart = await uc.execute(user_id=1, product_id=10, quantity=3)

    assert len(cart.items) == 1
    assert cart.items[0].product_id == 10
    assert cart.items[0].quantity == 3
    cart_repo.save.assert_called_once()


@pytest.mark.asyncio
async def test_add_item_merge_quantity():
    cart_repo = AsyncMock()
    product_repo = AsyncMock()

    product_repo.get_by_id.return_value = type("Product", (), {
        "id": 10,
        "name": "Item A",
        "price": 5.0,
        "stock": 5,
        "image_url": None
    })()

    cart_repo.get_by_user_id.return_value = Cart(
        user_id=1,
        items=[CartItem(product_id=10, quantity=3, price=5.0, name="Item A", image_url=None)]
    )

    uc = AddItemToCartUseCase(cart_repo, product_repo)

    cart = await uc.execute(1, 10, 10)  # request 10, stock is 5

    assert cart.items[0].quantity == 5  # capped by stock
    cart_repo.save.assert_called_once()


# ---------------------------------------------------------
# CALCULATE TOTALS
# ---------------------------------------------------------
@pytest.mark.asyncio
async def test_calculate_cart_totals_empty():
    cart_repo = AsyncMock()
    product_repo = AsyncMock()

    cart_repo.get_by_user_id.return_value = None

    uc = CalculateCartTotalsUseCase(cart_repo, product_repo, tax_rate=0.2)

    totals = await uc.execute(1)
    assert totals.subtotal == 0
    assert totals.tax == 0
    assert totals.total == 0


@pytest.mark.asyncio
async def test_calculate_cart_totals_with_items():
    cart_repo = AsyncMock()
    product_repo = AsyncMock()

    cart_repo.get_by_user_id.return_value = Cart(
        user_id=1,
        items=[
            CartItem(product_id=10, quantity=2, price=5.0, name="Item A", image_url=None),
            CartItem(product_id=20, quantity=1, price=10.0, name="Item B", image_url=None),
        ]
    )

    product_repo.get_by_id.side_effect = [
        type("Product", (), {"stock": 10})(),
        type("Product", (), {"stock": 10})(),
    ]

    uc = CalculateCartTotalsUseCase(cart_repo, product_repo, tax_rate=0.2)

    totals = await uc.execute(1)

    assert totals.subtotal == 20.0
    assert totals.tax == 4.0
    assert totals.total == 24.0
    cart_repo.save.assert_called_once()


# ---------------------------------------------------------
# CLEAR CART
# ---------------------------------------------------------
@pytest.mark.asyncio
async def test_clear_cart():
    cart_repo = AsyncMock()
    cart_repo.get_by_user_id.return_value = Cart(user_id=1, items=[CartItem(10, 2, 5.0, "Item A", None)])

    uc = ClearCartUseCase(cart_repo)

    await uc.execute(1)
    cart_repo.clear.assert_called_once_with(1)


@pytest.mark.asyncio
async def test_clear_cart_no_cart():
    cart_repo = AsyncMock()
    cart_repo.get_by_user_id.return_value = None

    uc = ClearCartUseCase(cart_repo)

    await uc.execute(1)
    cart_repo.clear.assert_not_called()


# ---------------------------------------------------------
# GET CART
# ---------------------------------------------------------
@pytest.mark.asyncio
async def test_get_cart_empty():
    cart_repo = AsyncMock()
    cart_repo.get_by_user_id.return_value = None

    uc = GetCartUseCase(cart_repo)

    cart = await uc.execute(1)
    assert cart.user_id == 1
    assert cart.items == []


@pytest.mark.asyncio
async def test_get_cart_existing():
    cart_repo = AsyncMock()
    cart_repo.get_by_user_id.return_value = Cart(
        user_id=1,
        items=[CartItem(10, 2, 5.0, "Item A", None)]
    )

    uc = GetCartUseCase(cart_repo)

    cart = await uc.execute(1)
    assert len(cart.items) == 1


# ---------------------------------------------------------
# REMOVE ITEM
# ---------------------------------------------------------
@pytest.mark.asyncio
async def test_remove_item():
    cart_repo = AsyncMock()
    cart_repo.get_by_user_id.return_value = Cart(
        user_id=1,
        items=[CartItem(10, 2, 5.0, "Item A", None)]
    )

    uc = RemoveCartItemUseCase(cart_repo)

    cart = await uc.execute(1, 10)
    assert cart.items == []
    cart_repo.save.assert_called_once()


@pytest.mark.asyncio
async def test_remove_item_no_cart():
    cart_repo = AsyncMock()
    cart_repo.get_by_user_id.return_value = None

    uc = RemoveCartItemUseCase(cart_repo)

    cart = await uc.execute(1, 10)
    assert cart.items == []


# ---------------------------------------------------------
# UPDATE QUANTITY
# ---------------------------------------------------------
@pytest.mark.asyncio
async def test_update_quantity():
    cart_repo = AsyncMock()
    product_repo = AsyncMock()

    cart_repo.get_by_user_id.return_value = Cart(
        user_id=1,
        items=[CartItem(10, 2, 5.0, "Item A", None)]
    )

    product_repo.get_by_id.return_value = type("Product", (), {"stock": 10})()

    uc = UpdateCartItemQuantityUseCase(cart_repo, product_repo)

    cart = await uc.execute(1, 10, 5)
    assert cart.items[0].quantity == 5
    cart_repo.save.assert_called_once()


@pytest.mark.asyncio
async def test_update_quantity_remove_item():
    cart_repo = AsyncMock()
    product_repo = AsyncMock()

    cart_repo.get_by_user_id.return_value = Cart(
        user_id=1,
        items=[CartItem(10, 2, 5.0, "Item A", None)]
    )

    uc = UpdateCartItemQuantityUseCase(cart_repo, product_repo)

    cart = await uc.execute(1, 10, 0)
    assert cart.items == []
    cart_repo.save.assert_called_once()


@pytest.mark.asyncio
async def test_update_quantity_not_enough_stock():
    cart_repo = AsyncMock()
    product_repo = AsyncMock()

    cart_repo.get_by_user_id.return_value = Cart(
        user_id=1,
        items=[CartItem(10, 2, 5.0, "Item A", None)]
    )

    product_repo.get_by_id.return_value = type("Product", (), {"stock": 1})()

    uc = UpdateCartItemQuantityUseCase(cart_repo, product_repo)

    with pytest.raises(ValueError):
        await uc.execute(1, 10, 5)

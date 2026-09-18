import pytest
from datetime import datetime

from cart.infrastructure.repositories.cart_repo_impl import CartRepository
from cart.domain.entities.cart import Cart, CartItem

from cart.infrastructure.db.cart_model import CartModel
from cart.infrastructure.db.cart_item_model import CartItemModel


# ---------------------------------------------------------
# SAVE + GET
# ---------------------------------------------------------
@pytest.mark.asyncio
async def test_save_and_get_cart(db_session):
    repo = CartRepository(db_session)

    cart = Cart(
        user_id=1,
        items=[
            CartItem(product_id=10, quantity=2, price=5.0, name="Item A", image_url=None),
            CartItem(product_id=20, quantity=1, price=10.0, name="Item B", image_url="img.png"),
        ]
    )

    await repo.save(cart)

    fetched = await repo.get_by_user_id(1)
    assert fetched is not None
    assert fetched.user_id == 1
    assert len(fetched.items) == 2

    assert fetched.items[0].product_id == 10
    assert fetched.items[0].quantity == 2
    assert fetched.items[0].price == 5.0

    assert fetched.items[1].product_id == 20
    assert fetched.items[1].quantity == 1
    assert fetched.items[1].price == 10.0


# ---------------------------------------------------------
# UPDATE CART
# ---------------------------------------------------------
@pytest.mark.asyncio
async def test_update_cart(db_session):
    repo = CartRepository(db_session)

    # initial cart
    cart = Cart(
        user_id=2,
        items=[CartItem(product_id=10, quantity=1, price=5.0, name="Item A", image_url=None)]
    )
    await repo.save(cart)

    # updated cart
    updated_cart = Cart(
        user_id=2,
        items=[CartItem(product_id=10, quantity=5, price=5.0, name="Item A", image_url=None)]
    )
    await repo.save(updated_cart)

    fetched = await repo.get_by_user_id(2)
    assert fetched is not None
    assert len(fetched.items) == 1
    assert fetched.items[0].quantity == 5


# ---------------------------------------------------------
# CLEAR CART
# ---------------------------------------------------------
@pytest.mark.asyncio
async def test_clear_cart(db_session):
    repo = CartRepository(db_session)

    cart = Cart(
        user_id=3,
        items=[CartItem(product_id=10, quantity=2, price=5.0, name="Item A", image_url=None)]
    )
    await repo.save(cart)

    await repo.clear(3)

    fetched = await repo.get_by_user_id(3)
    assert fetched is not None
    assert fetched.items == []


# ---------------------------------------------------------
# DELETE CART ENTIRELY
# ---------------------------------------------------------
@pytest.mark.asyncio
async def test_delete_cart(db_session):
    repo = CartRepository(db_session)

    cart = Cart(
        user_id=4,
        items=[CartItem(product_id=10, quantity=2, price=5.0, name="Item A", image_url=None)]
    )
    await repo.save(cart)

    await repo.delete(4)

    fetched = await repo.get_by_user_id(4)
    assert fetched is None

from typing import Optional
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from cart.domain.entities.cart_item import CartItem
from cart.domain.entities.cart import Cart
from cart.domain.interfaces.cart_repo import ICartRepository
from cart.infrastructure.db.cart_model import CartModel
from cart.infrastructure.db.cart_item_model import CartItemModel


class CartRepository(ICartRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    # ---------------------------------------------------------
    # INTERNAL MAPPER
    # ---------------------------------------------------------
    def _to_domain(self, cart_row: CartModel) -> Cart:
        items = [
            CartItem(
                product_id=item.product_id,
                quantity=int(item.quantity),  # ⭐ FIX
                price=float(item.price),  # ⭐ FIX
                name=item.name,
                image_url=item.image_url
            )
            for item in cart_row.items
        ]

        return Cart(
            user_id=cart_row.user_id,
            items=items
        )

    # ---------------------------------------------------------
    # GET CART BY USER ID
    # ---------------------------------------------------------
    async def get_by_user_id(self, user_id: int) -> Optional[Cart]:
        stmt = (
            select(CartModel)
            .where(CartModel.user_id == user_id)
            .options(
                selectinload(CartModel.items).selectinload(CartItemModel.product)
            )
        )

        result = await self.session.execute(stmt)
        cart_row = result.scalar_one_or_none()

        return self._to_domain(cart_row) if cart_row else None

    # ---------------------------------------------------------
    # SAVE CART (INSERT OR UPDATE)
    # ---------------------------------------------------------
    async def save(self, cart: Cart) -> None:
        # Check if cart exists
        stmt = select(CartModel).where(CartModel.user_id == cart.user_id)
        result = await self.session.execute(stmt)
        cart_row = result.scalar_one_or_none()

        if cart_row is None:
            cart_row = CartModel(user_id=cart.user_id)
            self.session.add(cart_row)
            await self.session.flush()

        # Clear existing items
        await self.session.execute(
            delete(CartItemModel).where(CartItemModel.cart_id == cart_row.id)
        )

        # Insert new items
        for item in cart.items:
            item_row = CartItemModel(
                cart_id=cart_row.id,
                product_id=item.product_id,
                quantity=int(item.quantity),  # ⭐ FIX
                price=float(item.price),  # ⭐ FIX
                name=item.name,
                image_url=item.image_url
            )

            self.session.add(item_row)

        await self.session.commit()

    # ---------------------------------------------------------
    # CLEAR CART (REMOVE ALL ITEMS)
    # ---------------------------------------------------------
    async def clear(self, user_id: int) -> None:
        stmt = select(CartModel).where(CartModel.user_id == user_id)
        result = await self.session.execute(stmt)
        cart_row = result.scalar_one_or_none()

        if cart_row:
            await self.session.execute(
                delete(CartItemModel).where(CartItemModel.cart_id == cart_row.id)
            )
            await self.session.commit()

    # ---------------------------------------------------------
    # DELETE CART ENTIRELY
    # ---------------------------------------------------------
    async def delete(self, user_id: int) -> None:
        stmt = select(CartModel).where(CartModel.user_id == user_id)
        result = await self.session.execute(stmt)
        cart_row = result.scalar_one_or_none()

        if cart_row:
            await self.session.execute(
                delete(CartItemModel).where(CartItemModel.cart_id == cart_row.id)
            )
            await self.session.execute(
                delete(CartModel).where(CartModel.id == cart_row.id)
            )
            await self.session.commit()

    # ---------------------------------------------------------
    # DELETE CART ITEMS BY PRODUCT ID
    # ---------------------------------------------------------
    async def delete_items_by_product_id(self, product_id: int) -> None:
        """Delete all cart items referencing a specific product."""
        await self.session.execute(
            delete(CartItemModel).where(CartItemModel.product_id == product_id)
        )
        await self.session.commit()


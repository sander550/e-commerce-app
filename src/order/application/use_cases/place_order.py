from datetime import datetime, timedelta
from order.domain.entities.order import Order, OrderItem
from order.domain.interfaces.order_repo import IOrderRepository
from cart.domain.interfaces.cart_repo import ICartRepository
from catalog.domain.interfaces.product_repo import IProductRepository
from core.config.settings import settings


class PlaceOrderUseCase:
    def __init__(
        self,
        cart_repo: ICartRepository,
        order_repo: IOrderRepository,
        product_repo: IProductRepository,
    ):
        self.cart_repo = cart_repo
        self.order_repo = order_repo
        self.product_repo = product_repo
        self.tax_rate = settings.TAX_RATE
        self.reservation_time = settings.RESERVATION_TIME

    async def execute(
        self,
        user_id: int,
        shipping_address: str,
        delivery_method: str
    ) -> Order:

        cart = await self.cart_repo.get_by_user_id(user_id)
        if not cart or not cart.items:
            raise ValueError("Cart is empty")

        # ---------------------------------------------------------
        # Auto-fix stock
        # ---------------------------------------------------------
        updated_items = []

        for item in cart.items:
            product = await self.product_repo.get_by_id(item.product_id)
            if not product:
                continue

            if product.stock == 0:
                continue

            if item.quantity > product.stock:
                item.quantity = product.stock

            updated_items.append(item)

        cart.items = updated_items
        await self.cart_repo.save(cart)

        if not cart.items:
            raise ValueError("No products are currently available")

        # ---------------------------------------------------------
        # Build order items
        # ---------------------------------------------------------
        order_items = [
            OrderItem(
                product_id=item.product_id,
                name=item.name,
                price=item.price,
                quantity=item.quantity,
                image_url=item.image_url
            )
            for item in cart.items
        ]

        # ---------------------------------------------------------
        # Create new order with reservation expiration
        # ---------------------------------------------------------
        order = Order(
            id=None,
            user_id=user_id,
            shipping_address=shipping_address,
            delivery_method=delivery_method,
            items=order_items,
            status="pending",
            reservation_expires_at=datetime.utcnow() + timedelta(self.reservation_time)
        )

        order.calculate_totals(self.tax_rate)

        # ---------------------------------------------------------
        # Reserve stock
        # ---------------------------------------------------------
        for item in sorted(order_items, key=lambda x: x.product_id):
            reserved = await self.product_repo.reserve_stock(
                product_id=item.product_id,
                quantity=item.quantity
            )

            if not reserved:
                raise ValueError(
                    f"Not enough stock for product {item.product_id}"
                )

        saved_order = await self.order_repo.save(order)
        return saved_order

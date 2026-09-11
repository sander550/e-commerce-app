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

        # ---------------------------------------------------------
        # Hard stock check
        # ---------------------------------------------------------
        for item in cart.items:
            product = await self.product_repo.get_by_id(item.product_id)
            if product.stock < item.quantity:
                raise ValueError(f"Not enough stock for product {product.id}")

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
        # Create new order
        # ---------------------------------------------------------
        order = Order(
            id=None,
            user_id=user_id,
            shipping_address=shipping_address,
            delivery_method=delivery_method,
            items=order_items,
            status="pending"
        )

        order.calculate_totals(self.tax_rate)

        saved_order = await self.order_repo.save(order)
        return saved_order

from order.domain.interfaces.order_repo import IOrderRepository
from order.domain.entities.order import Order

class UpdateOrderUseCase:
    def __init__(self, order_repo: IOrderRepository):
        self.order_repo = order_repo

    async def execute(
        self,
        order_id: int,
        status: str | None = None,
        shipping_address: str | None = None,
        delivery_method: str | None = None,
    ):
        # Validate order exists
        order = await self.order_repo.get_by_id(order_id)
        if order is None:
            raise ValueError("Order does not exist")

        # Validate status
        if status is not None:
            valid_statuses = [
                "pending",
                "shipped",
                "failed",
                "payed"
            ]
            if status not in valid_statuses:
                raise ValueError("Invalid order status")

        # Validate delivery method
        if delivery_method is not None:
            valid_methods = ["standard", "express", "pickup"]
            if delivery_method not in valid_methods:
                raise ValueError("Invalid delivery method")

        new_order = Order(
            id=order_id,
            status=status,
            shipping_address=shipping_address,
            delivery_method=delivery_method,

            user_id=order.user_id,
            items=order.items,
            subtotal=order.subtotal,
            tax=order.tax,
            total=order.total,
            created_at=order.created_at,
        )


        # Update fields
        return await self.order_repo.save(new_order)

from order.domain.interfaces.order_repo import IOrderRepository

class DeleteOrderUseCase:
    def __init__(self, order_repo: IOrderRepository):
        self.order_repo = order_repo

    async def execute(self, user_id: int, order_id: int) -> bool:
        # Fetch order
        order = await self.order_repo.get_by_id(order_id)
        if not order:
            raise Exception("Order not found")

        # Ensure user owns the order
        if order.user_id != user_id:
            raise Exception("Unauthorized")

        # Delete
        await self.order_repo.delete(order_id)
        return True

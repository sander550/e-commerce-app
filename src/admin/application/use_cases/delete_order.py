from order.domain.interfaces.order_repo import IOrderRepository


class DeleteOrderUseCase:
    def __init__(self, order_repo: IOrderRepository):
        self.order_repo = order_repo

    async def execute(self, order_id: int):
        order = await self.order_repo.get_by_id(order_id)
        if order is None:
            raise ValueError("Order does not exist")

        await self.order_repo.delete(order_id)

from order.domain.entities.order import Order
from order.domain.interfaces.order_repo import IOrderRepository


class ListUserOrdersUseCase:
    def __init__(self, order_repo: IOrderRepository):
        self.order_repo = order_repo

    async def execute(self, user_id: int):
        return await self.order_repo.list_by_user_id(user_id)


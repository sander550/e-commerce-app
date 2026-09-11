from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload

from order.domain.entities.order import Order, OrderItem
from order.domain.interfaces.order_repo import IOrderRepository

from order.infrastructure.db.order_model import OrderModel
from order.infrastructure.db.order_item_model import OrderItemModel


class OrderRepository(IOrderRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    # ---------------------------------------------------------
    # INTERNAL MAPPER
    # ---------------------------------------------------------
    def _to_domain(self, model: OrderModel) -> Order:
        items = [
            OrderItem(
                product_id=item.product_id,
                name=item.name,
                price=item.price,
                quantity=item.quantity,
                image_url=item.image_url
            )
            for item in model.items
        ]
        return Order(
            id=model.id,
            user_id=model.user_id,
            shipping_address=model.shipping_address,
            delivery_method=model.delivery_method,
            subtotal=model.subtotal,
            tax=model.tax,
            total=model.total,
            status=model.status,
            items=items,
            created_at=model.created_at
        )

    async def save(self, order: Order) -> Order | None:
        # UPDATE
        if order.id:
            db_order = await self.get_model_by_id(order.id)
            if not db_order:
                return None

            db_order.status = order.status
            db_order.subtotal = order.subtotal
            db_order.tax = order.tax
            db_order.total = order.total

            # NEW FIELDS
            db_order.shipping_address = order.shipping_address
            db_order.delivery_method = order.delivery_method

            # delete existing items
            await self.session.execute(
                delete(OrderItemModel).where(OrderItemModel.order_id == db_order.id)
            )

            # insert new items
            for item in order.items:
                self.session.add(
                    OrderItemModel(
                        order_id=db_order.id,
                        product_id=item.product_id,
                        name=item.name,
                        price=item.price,
                        quantity=item.quantity,
                        image_url=item.image_url,
                    )
                )

        # INSERT
        else:
            db_order = OrderModel(
                user_id=order.user_id,
                subtotal=order.subtotal,
                tax=order.tax,
                total=order.total,
                status=order.status,

                # NEW FIELDS
                shipping_address=order.shipping_address,
                delivery_method=order.delivery_method,
            )

            self.session.add(db_order)
            await self.session.flush()  # get db_order.id

            for item in order.items:
                self.session.add(
                    OrderItemModel(
                        order_id=db_order.id,
                        product_id=item.product_id,
                        name=item.name,
                        price=item.price,
                        quantity=item.quantity,
                        image_url=item.image_url,
                    )
                )

        await self.session.commit()

        # re‑load with items eagerly loaded
        stmt = (
            select(OrderModel)
            .where(OrderModel.id == db_order.id)
            .options(selectinload(OrderModel.items))
        )
        result = await self.session.execute(stmt)
        loaded = result.scalar_one()

        return self._to_domain(loaded)

    # ---------------------------------------------------------
    # GET ORDER BY ID
    # ---------------------------------------------------------
    async def get_by_id(self, order_id: int) -> Order | None:
        stmt = (
            select(OrderModel)
            .where(OrderModel.id == order_id)
            .options(selectinload(OrderModel.items))
        )

        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_domain(model) if model else None

    # ---------------------------------------------------------
    # LIST ORDERS BY USER
    # ---------------------------------------------------------
    async def list_by_user_id(self, user_id: int) -> list[Order]:
        stmt = (
            select(OrderModel)
            .where(OrderModel.user_id == user_id)
            .options(selectinload(OrderModel.items))
        )
        result = await self.session.execute(stmt)
        models = result.scalars().all()
        return [self._to_domain(m) for m in models]

    # ---------------------------------------------------------
    # INTERNAL HELPER
    # ---------------------------------------------------------
    async def get_model_by_id(self, order_id: int) -> OrderModel | None:
        stmt = (
            select(OrderModel)
            .where(OrderModel.id == order_id)
            .options(selectinload(OrderModel.items))
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()


    async def delete(self, order_id: int) -> None:
        # Delete items first (FK cascade safe but explicit is cleaner)
        await self.session.execute(
            delete(OrderItemModel).where(OrderItemModel.order_id == order_id)
        )

        # Delete order
        await self.session.execute(
            delete(OrderModel).where(OrderModel.id == order_id)
        )

        await self.session.commit()

    async def get_last_order_for_user(self, user_id: int) -> Order | None:
        orders = await self.list_by_user_id(user_id)
        if not orders:
            return None

        # Assuming orders are stored oldest → newest
        return orders[-1]

    async def find_duplicate_order(self, user_id: int, items: list[OrderItem]) -> Order | None:
        last_order = await self.get_last_order_for_user(user_id)
        if not last_order:
            return None

        if len(last_order.items) != len(items):
            return None

        for a, b in zip(last_order.items, items):
            if (
                    a.product_id != b.product_id or
                    a.quantity != b.quantity or
                    a.price != b.price
            ):
                return None

        return last_order



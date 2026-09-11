from fastapi import APIRouter, Depends, HTTPException
from core.security.dependencies import auth_required
from order.application.use_cases.place_order import PlaceOrderUseCase
from order.application.use_cases.get_order_details import GetOrderDetailsUseCase
from order.application.use_cases.list_user_orders import ListUserOrdersUseCase


from order.application.dto.order_dto import OrderResponseDTO, PlaceOrderDTO

from core.application.use_case_factories.order_factories import (
    get_place_order_use_case,
    get_get_order_details_use_case,
    get_list_user_orders_use_case,
    get_delete_order_use_case
)

router = APIRouter(prefix="/orders", tags=["orders"])


# ---------------------------------------------------------
# CREATE ORDER FROM CART
# ---------------------------------------------------------
@router.post("/", response_model=OrderResponseDTO)
async def place_order(
    dto: PlaceOrderDTO,
    user=Depends(auth_required),
    use_case: PlaceOrderUseCase = Depends(get_place_order_use_case)
):
    try:
        order = await use_case.execute(user.id, dto.shipping_address, dto.delivery_method)
        return OrderResponseDTO.from_domain(order)
    except Exception as e:
        raise HTTPException(400, str(e))


# ---------------------------------------------------------
# LIST USER ORDERS
# ---------------------------------------------------------
@router.get("/list", response_model=list[OrderResponseDTO])
async def list_user_orders(
    user=Depends(auth_required),
    use_case: ListUserOrdersUseCase = Depends(get_list_user_orders_use_case)
):
    try:
        orders = await use_case.execute(user.id)

        return [OrderResponseDTO.from_domain(o) for o in orders]
    except Exception as e:
        raise HTTPException(400, str(e))



# ---------------------------------------------------------
# GET ORDER DETAILS
# ---------------------------------------------------------
@router.get("/{order_id}", response_model=OrderResponseDTO)
async def get_order_details(
    order_id: int,
    user=Depends(auth_required),
    use_case: GetOrderDetailsUseCase = Depends(get_get_order_details_use_case)
):
    try:
        order = await use_case.execute(user.id, order_id)
        return OrderResponseDTO.from_domain(order)
    except Exception as e:
        raise HTTPException(400, str(e))


@router.delete("/{order_id}")
async def delete_order(
    order_id: int,
    user=Depends(auth_required),
    use_case: GetOrderDetailsUseCase = Depends(get_delete_order_use_case)
):
    try:
        return await use_case.execute(user.id, order_id)
    except Exception as e:
        raise HTTPException(400, str(e))



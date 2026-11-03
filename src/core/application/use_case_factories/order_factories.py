from fastapi import Depends
from core.application.providers.repo_provider import RepoProvider, get_provider

from order.application.use_cases.place_order import PlaceOrderUseCase
from order.application.use_cases.get_order_details import GetOrderDetailsUseCase
from order.application.use_cases.list_user_orders import ListUserOrdersUseCase
from order.application.use_cases.delete_order import DeleteOrderUseCase

def get_place_order_use_case(
    provider: RepoProvider = Depends(get_provider)
) -> PlaceOrderUseCase:
    return PlaceOrderUseCase(
        cart_repo=provider.cart_repo,
        order_repo=provider.order_repo,
        product_repo=provider.product_repo
    )


def get_get_order_details_use_case(
    provider: RepoProvider = Depends(get_provider)
) -> GetOrderDetailsUseCase:
    return GetOrderDetailsUseCase(
        order_repo=provider.order_repo
    )


def get_list_user_orders_use_case(
    provider: RepoProvider = Depends(get_provider)
) -> ListUserOrdersUseCase:
    return ListUserOrdersUseCase(
        order_repo=provider.order_repo
    )

def get_delete_order_use_case(
    provider: RepoProvider = Depends(get_provider)
) -> DeleteOrderUseCase:
    return DeleteOrderUseCase(
        order_repo=provider.order_repo
    )

from fastapi import Depends
from core.application.providers.repo_provider import get_provider

from catalog.application.use_cases.list_products import ListProductsUseCase
from catalog.application.use_cases.get_product_details import GetProductDetailsUseCase
from catalog.application.use_cases.get_products_by_category import GetProductsByCategoryUseCase
from catalog.application.use_cases.list_categories import ListCategoriesUseCase

def get_list_products_use_case(
    provider = Depends(get_provider)
) -> ListProductsUseCase:
    return ListProductsUseCase(
        product_repo=provider.product_repo
    )


def get_product_details_use_case(
    provider = Depends(get_provider)
) -> GetProductDetailsUseCase:
    return GetProductDetailsUseCase(
        product_repo=provider.product_repo,
        category_repo=provider.category_repo
    )


def get_products_by_category_use_case(
    provider = Depends(get_provider)
) -> GetProductsByCategoryUseCase:
    return GetProductsByCategoryUseCase(
        product_repo=provider.product_repo,
        category_repo=provider.category_repo
    )

def get_list_categories_use_case(
    provider = Depends(get_provider)
) -> GetProductsByCategoryUseCase:
    return ListCategoriesUseCase(
        category_repo=provider.category_repo
    )

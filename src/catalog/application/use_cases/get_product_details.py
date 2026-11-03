# src/catalog/domain/use_cases/get_product_details_use_case.py

from catalog.domain.entities.product import Product
from catalog.domain.interfaces.product_repo import IProductRepository
from catalog.domain.interfaces.category_repo import ICategoryRepository


class GetProductDetailsUseCase:
    def __init__(self, product_repo: IProductRepository, category_repo: ICategoryRepository):
        self.product_repo = product_repo
        self.category_repo = category_repo

    async def execute(self, product_id: int) -> Product:
        product = await self.product_repo.get_by_id(product_id)
        if product is None:
            raise ValueError("Product not found")

        category = await self.category_repo.get_by_id(product.category_id)
        if category is None:
            raise ValueError("Category not found")

        product.category = category
        return product

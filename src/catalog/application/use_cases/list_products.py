from typing import List
from catalog.domain.entities.product import Product
from catalog.domain.interfaces.product_repo import IProductRepository


class ListProductsUseCase:
    def __init__(self, product_repo: IProductRepository):
        self.product_repo = product_repo

    async def execute(self) -> List[Product]:
        products = await self.product_repo.list()
        return products

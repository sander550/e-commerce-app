from typing import List
from catalog.domain.entities.product import Product
from catalog.domain.interfaces.product_repo import IProductRepository
from catalog.domain.interfaces.category_repo import ICategoryRepository


class GetProductsByCategoryUseCase:
    def __init__(
        self,
        product_repo: IProductRepository,
        category_repo: ICategoryRepository
    ):
        self.product_repo = product_repo
        self.category_repo = category_repo

    async def execute(self, category_id: int) -> List[Product]:
        # Fetch products that already contain Category inside them
        products = await self.product_repo.list_by_category(category_id)
        if not products:
            return []
        return products

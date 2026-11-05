from catalog.domain.interfaces.category_repo import ICategoryRepository
from catalog.domain.interfaces.product_repo import IProductRepository
from cart.domain.interfaces.cart_repo import ICartRepository

class DeleteCategoryUseCase:
    def __init__(self, category_repo: ICategoryRepository, product_repo: IProductRepository, cart_repo: ICartRepository):
        self.category_repo = category_repo
        self.product_repo = product_repo
        self.cart_repo = cart_repo

    async def execute(self, category_id: int):
        existing = await self.category_repo.get_by_id(category_id)
        if existing is None:
            raise ValueError("Category does not exist")

        # Get all products in this category
        products = await self.product_repo.list_by_category(category_id)

        # Delete cart items for each product first
        for product in products:
            await self.cart_repo.delete_items_by_product_id(product.id)

        # Delete products in this category
        for product in products:
            await self.product_repo.delete(product.id)

        # Delete the category (CASCADE will also delete products at DB level,
        # but we already deleted them explicitly for cart cleanup)
        await self.category_repo.delete(category_id)

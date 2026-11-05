from catalog.domain.interfaces.product_repo import IProductRepository
from cart.domain.interfaces.cart_repo import ICartRepository

class DeleteProductUseCase:
    def __init__(self, product_repo: IProductRepository, cart_repo: ICartRepository, vector_store):
        self.product_repo = product_repo
        self.cart_repo = cart_repo
        self.vector_store = vector_store

    async def execute(self, product_id: int):
        existing = await self.product_repo.get_by_id(product_id)
        if existing is None:
            raise ValueError("Product does not exist")

        # Delete associated cart items first (to avoid FK constraint violation)
        await self.cart_repo.delete_items_by_product_id(product_id)

        # Delete from DB
        await self.product_repo.delete(product_id)

        # Delete from Chroma
        await self.vector_store.delete(product_id)


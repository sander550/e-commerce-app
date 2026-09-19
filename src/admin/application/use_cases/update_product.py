from catalog.domain.entities.product import Product
from catalog.domain.interfaces.product_repo import IProductRepository
from catalog.domain.interfaces.category_repo import ICategoryRepository

class UpdateProductUseCase:
    def __init__(self,
                 product_repo: IProductRepository, category_repo: ICategoryRepository,
                 embedding_service, vector_store):

        self.product_repo = product_repo
        self.category_repo = category_repo
        self.embedding_service = embedding_service
        self.vector_store = vector_store

    async def execute(
        self,
        product_id: int,
        name: str | None = None,
        description: str | None = None,
        price: float | None = None,
        stock: int | None = None,
        category_id: int | None = None,
        image_url: str | None = None,
        is_active: bool | None = None
    ):
        existing = await self.product_repo.get_by_id(product_id)
        if existing is None:
            raise ValueError("Product does not exist")

        if name is not None and name.strip() == "":
            raise ValueError("Product name cannot be empty")

        if price is not None and price <= 0:
            raise ValueError("Price must be greater than zero")

        if stock is not None and stock < 0:
            raise ValueError("Stock cannot be negative")

        if category_id is not None:
            category = await self.category_repo.get_by_id(category_id)
            if category is None:
                raise ValueError("Category does not exist")

        # Build updated domain entity
        product = Product(
            id=product_id,
            name=name or existing.name,
            description=description or existing.description,
            price=price or existing.price,
            stock=stock or existing.stock,
            category_id=category_id or existing.category_id,
            image_url=image_url or existing.image_url,
            is_active=is_active if is_active is not None else existing.is_active
        )

        updated = await self.product_repo.update(product)

        # Generate new embedding
        text = f"{updated.name} {updated.description or ''}"
        embedding = await self.embedding_service.embed(text)

        await self.vector_store.upsert(updated.id, embedding)

        return updated

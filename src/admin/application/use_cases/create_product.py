from catalog.domain.entities.product import Product
from catalog.domain.interfaces.category_repo import ICategoryRepository
from catalog.domain.interfaces.product_repo import IProductRepository


class CreateProductUseCase:
    def __init__(self,
                 product_repo: IProductRepository,
                 category_repo: ICategoryRepository,
                 embedding_service,
                 vector_store):

        self.product_repo = product_repo
        self.category_repo = category_repo
        self.embedding_service = embedding_service
        self.vector_store = vector_store

    async def execute(
        self,
        name: str,
        description: str | None,
        price: float,
        stock: int,
        category_id: int,
        image_url: str | None
    ):
        if not name or name.strip() == "":
            raise ValueError("Product name cannot be empty")

        if price <= 0:
            raise ValueError("Price must be greater than zero")

        if stock < 0:
            raise ValueError("Stock cannot be negative")

        # Validate category exists
        category = await self.category_repo.get_by_id(category_id)
        if category is None:
            raise ValueError("Category does not exist")

        # Create domain entity
        product = Product(
            id=None,
            name=name,
            description=description,
            price=price,
            stock=stock,
            category_id=category_id,
            image_url=image_url,
            is_active=True
        )

        # Save to DB
        created = await self.product_repo.create(product)

        # Generate embedding
        text = (
            f"Name: {created.name}. "
            f"Description: {created.description or ''}. "
            f"Category: {category.name if category else ''}. "
            f"Price: {created.price}. "
        )

        embedding = await self.embedding_service.embed(text)
        # Add to Chroma
        await self.vector_store.add(created.id, embedding)

        return created

from catalog.domain.entities.product import Product
from abc import ABC, abstractmethod



class IProductRepository(ABC):

    @abstractmethod
    async def get_by_id(self, product_id: int):
        """Return a single product by ID."""
        pass

    @abstractmethod
    async def get_by_name(self, name: str):
        """Return a product with the given name, if any."""
        pass

    @abstractmethod
    async def list(self):
        """Return all products."""
        pass

    @abstractmethod
    async def list_by_category(self, category_id: int):
        """Return all products in a specific category."""
        pass

    @abstractmethod
    async def update(self, product: Product):
        """Update an existing product."""
        pass

from catalog.domain.entities.product import Product
from abc import ABC, abstractmethod
from typing import Optional, List


class IProductRepository(ABC):

    @abstractmethod
    async def get_by_id(self, product_id: int) -> Optional[Product]:
        """Return a single product by ID."""
        pass

    @abstractmethod
    async def get_by_name(self, name: str) -> Optional[Product]:
        """Return a product with the given name, if any."""
        pass

    @abstractmethod
    async def list(self) -> List[Product]:
        """Return all products."""
        pass

    @abstractmethod
    async def list_by_category(self, category_id: int) -> List[Product]:
        """Return all products in a specific category."""
        pass

    @abstractmethod
    async def update(self, product: Product) -> Optional[Product]:
        """Update an existing product."""
        pass

    @abstractmethod
    async def create(self, product: Product) -> Product:
        """Create a new product."""
        pass

    @abstractmethod
    async def delete(self, product_id: int) -> None:
        """Delete a product by ID."""
        pass

    @abstractmethod
    async def search_keyword(self, query: str) -> List[int]:
        """Search products by keyword, return matching product IDs."""
        pass

    @abstractmethod
    async def reserve_stock(self, product_id: int, quantity: int) -> bool:
        """Reserve stock for a product. Returns True if successful."""
        pass
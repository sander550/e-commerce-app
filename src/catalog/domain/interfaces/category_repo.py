from abc import ABC, abstractmethod
from typing import Optional, List
from catalog.domain.entities.category import Category


class ICategoryRepository(ABC):

    @abstractmethod
    async def get_by_id(self, category_id: int) -> Optional[Category]:
        """Return a single category by ID."""
        pass

    @abstractmethod
    async def get_by_name(self, name: str) -> Optional[Category]:
        """Return a category with the given name, if any."""
        pass

    @abstractmethod
    async def list(self) -> List[Category]:
        """Return all categories."""
        pass

    @abstractmethod
    async def create(self, name: str, parent_id: int | None) -> Category:
        """Create a new category."""
        pass

    @abstractmethod
    async def update(
        self,
        category_id: int,
        name: str | None,
        parent_id: int | None
    ) -> Optional[Category]:
        """Update an existing category."""
        pass

    @abstractmethod
    async def delete(self, category_id: int) -> None:
        """Delete a category by ID."""
        pass
from abc import ABC, abstractmethod


class ICategoryRepository(ABC):

    @abstractmethod
    async def get_by_id(self, category_id: int):
        """Return a single category by ID."""
        pass

    @abstractmethod
    async def list(self):
        """Return all categories."""
        pass

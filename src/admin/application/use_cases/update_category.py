from catalog.domain.entities.category import Category


class UpdateCategoryUseCase:
    def __init__(self, category_repo):
        self.category_repo = category_repo

    async def execute(
        self,
        category_id: int,
        name: str | None = None,
        parent_id: int | None = None
    ) -> Category:
        # Validate category exists
        existing = await self.category_repo.get_by_id(category_id)
        if existing is None:
            raise ValueError("Category does not exist")

        # Validate name (if provided)
        if name is not None and name.strip() == "":
            raise ValueError("Category name cannot be empty")

        # Validate parent category (if provided)
        if parent_id is not None:
            # Prevent self-reference
            if parent_id == category_id:
                raise ValueError("Category cannot be its own parent")

            parent = await self.category_repo.get_by_id(parent_id)
            if parent is None:
                raise ValueError("Parent category does not exist")

            # Prevent circular reference - check if parent is a descendant
            if await self._would_create_cycle(category_id, parent_id):
                raise ValueError("Cannot set parent: would create circular reference")

        # Perform update
        updated = await self.category_repo.update(
            category_id=category_id,
            name=name,
            parent_id=parent_id
        )

        return updated

    async def _would_create_cycle(self, category_id: int, new_parent_id: int) -> bool:
        """Check if setting new_parent_id as parent of category_id would create a cycle."""
        current_id = new_parent_id
        while current_id is not None:
            if current_id == category_id:
                return True
            parent = await self.category_repo.get_by_id(current_id)
            current_id = parent.parent_id if parent else None
        return False

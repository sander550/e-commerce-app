
class CreateCategoryUseCase:
    def __init__(self, category_repo):
        self.category_repo = category_repo

    async def execute(self, name: str, parent_id: int | None = None):
        # Business rule validation
        if not name or name.strip() == "":
            raise ValueError("Category name cannot be empty")

        # Optional: validate parent exists
        if parent_id is not None:
            parent = await self.category_repo.get_by_id(parent_id)
            if parent is None:
                raise ValueError("Parent category does not exist")

        # Persist
        return await self.category_repo.create(
            name=name,
            parent_id=parent_id
        )

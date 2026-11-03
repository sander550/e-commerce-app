class DeleteCategoryUseCase:
    def __init__(self, category_repo):
        self.category_repo = category_repo

    async def execute(self, category_id: int):
        existing = await self.category_repo.get_by_id(category_id)
        if existing is None:
            raise ValueError("Category does not exist")

        await self.category_repo.delete(category_id)

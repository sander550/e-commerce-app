from catalog.domain.interfaces.category_repo import ICategoryRepository


class ListCategoriesUseCase:
    def __init__(self, category_repo: ICategoryRepository):
        self.category_repo = category_repo

    async def execute(self):
        return await self.category_repo.list()

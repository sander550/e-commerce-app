from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select

from catalog.domain.entities.category import Category
from catalog.domain.interfaces.category_repo import ICategoryRepository
from catalog.infrastructure.db.category_model import CategoryModel


class CategoryRepository(ICategoryRepository):
    def __init__(self, session: AsyncSession):
        self.session = session


    def _to_domain(self, row: CategoryModel) -> Category:
        return Category(
            id=row.id,
            name=row.name,
            parent_id=row.parent_id
        )

    async def create(self, name: str, parent_id: int | None) -> Category:
        # Insert ORM model
        model = CategoryModel(
            name=name,
            parent_id=parent_id
        )

        self.session.add(model)
        await self.session.commit()
        await self.session.refresh(model)

        # Return domain entity
        return self._to_domain(model)


    async def get_by_id(self, category_id: int) -> Optional[Category]:
        stmt = select(CategoryModel).where(CategoryModel.id == category_id)
        result = await self.session.execute(stmt)
        row = result.scalar_one_or_none()

        return self._to_domain(row) if row else None


    async def get_by_name(self, name: str) -> Optional[Category]:
        stmt = select(CategoryModel).where(
            func.lower(CategoryModel.name) == name.strip().lower()
        )
        result = await self.session.execute(stmt)
        row = result.scalar_one_or_none()

        return self._to_domain(row) if row else None


    async def list(self) -> List[Category]:
        stmt = select(CategoryModel)
        result = await self.session.execute(stmt)
        rows = result.scalars().all()

        return [self._to_domain(row) for row in rows]


    async def update(
        self,
        category_id: int,
        name: str | None,
        parent_id: int | None
    ) -> Category | None:
        # Fetch existing model
        stmt = select(CategoryModel).where(CategoryModel.id == category_id)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()

        if model is None:
            return None

        # Apply updates only if provided
        if name is not None:
            model.name = name

        if parent_id is not None:
            model.parent_id = parent_id

        await self.session.commit()
        await self.session.refresh(model)

        return self._to_domain(model)


    async def delete(self, category_id: int) -> None:
        stmt = select(CategoryModel).where(CategoryModel.id == category_id)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()

        if model is None:
            return None

        await self.session.delete(model)
        await self.session.commit()
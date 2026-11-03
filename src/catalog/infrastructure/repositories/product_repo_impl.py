from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select

from catalog.domain.entities.product import Product
from catalog.domain.interfaces.product_repo import IProductRepository
from catalog.domain.interfaces.category_repo import ICategoryRepository

from catalog.infrastructure.db.product_model import ProductModel


class ProductRepository(IProductRepository):
    def __init__(self, session: AsyncSession, category_repo: ICategoryRepository):
        self.session = session
        self.category_repo = category_repo

    # ---------------------------------------------------------
    # INTERNAL MAPPER
    # ---------------------------------------------------------
    def _to_domain(self, row: ProductModel) -> Product:

        return Product(
            id=row.id,
            name=row.name,
            description=row.description,
            price=row.price,
            stock=row.stock,
            category_id=row.category_id,
            image_url=row.image_url,
            is_active=row.is_active,
        )

    async def create(
        self, product: Product):
        model = ProductModel(
            name=product.name,
            description=product.description,
            price=product.price,
            stock=product.stock,
            category_id=product.category_id,
            image_url=product.image_url,
            is_active=True
        )

        self.session.add(model)
        await self.session.commit()
        await self.session.refresh(model)

        return self._to_domain(model)


    async def get_by_id(self, product_id: int) -> Optional[Product]:
        stmt = select(ProductModel).where(ProductModel.id == product_id)
        result = await self.session.execute(stmt)
        row = result.scalar_one_or_none()

        return self._to_domain(row) if row else None


    async def get_by_name(self, name: str) -> Optional[Product]:
        stmt = select(ProductModel).where(
            func.lower(ProductModel.name) == name.strip().lower()
        )
        result = await self.session.execute(stmt)
        row = result.scalar_one_or_none()

        return self._to_domain(row) if row else None


    async def list(self) -> List[Product]:
        stmt = select(ProductModel)
        result = await self.session.execute(stmt)
        rows = result.scalars().all()

        return [self._to_domain(row) for row in rows]


    async def list_by_category(self, category_id: int) -> List[Product]:
        stmt = select(ProductModel).where(ProductModel.category_id == category_id)
        result = await self.session.execute(stmt)
        rows = result.scalars().all()

        return [self._to_domain(row) for row in rows]


    async def update(self, product: Product) -> Product | None:
        stmt = select(ProductModel).where(ProductModel.id == product.id)
        result = await self.session.execute(stmt)
        row = result.scalar_one_or_none()

        if row is None:
            return None

        # Update only fields that were provided
        if product.name is not None:
            row.name = product.name

        if product.description is not None:
            row.description = product.description

        if product.price is not None:
            row.price = product.price

        if product.stock is not None:
            row.stock = product.stock

        if product.category_id is not None:
            row.category_id = product.category_id

        if product.image_url is not None:
            row.image_url = product.image_url

        if product.is_active is not None:
            row.is_active = product.is_active

        await self.session.commit()
        await self.session.refresh(row)

        return self._to_domain(row)


    async def delete(self, product_id: int) -> None:
        stmt = select(ProductModel).where(ProductModel.id == product_id)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()

        if model is None:
            return None

        await self.session.delete(model)
        await self.session.commit()

    async def search_keyword(self, query: str):
        query_lower = query.lower()

        products = await self.list()

        matched_ids = []
        for p in products:
            name = p.name.lower()
            desc = (p.description or "").lower()

            if query_lower in name or query_lower in desc:
                matched_ids.append(p.id)

        return matched_ids


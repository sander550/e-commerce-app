from sqlalchemy import select, delete
from sqlalchemy.dialects.postgresql import insert as pg_insert
from core.infrastructure.database import async_session_factory
from search.infrastructure.db.embedding_model import ProductEmbeddingModel


class PgVectorStore:
    def __init__(self, session_factory=async_session_factory):
        self.session_factory = session_factory

    async def add(self, id: int, embedding: list[float]) -> None:
        async with self.session_factory() as session:
            model = ProductEmbeddingModel(product_id=id, embedding=embedding)
            session.add(model)
            await session.commit()

    async def upsert(self, id: int, embedding: list[float]) -> None:
        async with self.session_factory() as session:
            stmt = pg_insert(ProductEmbeddingModel).values(
                product_id=id, embedding=embedding
            )
            stmt = stmt.on_conflict_do_update(
                index_elements=["product_id"],
                set_={"embedding": stmt.excluded.embedding},
            )
            await session.execute(stmt)
            await session.commit()

    async def delete(self, id: int) -> None:
        async with self.session_factory() as session:
            stmt = delete(ProductEmbeddingModel).where(
                ProductEmbeddingModel.product_id == id
            )
            await session.execute(stmt)
            await session.commit()

    async def search(self, embedding: list[float], limit: int = 10) -> list[int]:
        async with self.session_factory() as session:
            stmt = (
                select(ProductEmbeddingModel.product_id)
                .order_by(ProductEmbeddingModel.embedding.cosine_distance(embedding))
                .limit(limit)
            )
            result = await session.execute(stmt)
            return [row[0] for row in result.all()]

    async def search_l2(self, embedding: list[float], limit: int = 10) -> list[int]:
        async with self.session_factory() as session:
            stmt = (
                select(ProductEmbeddingModel.product_id)
                .order_by(ProductEmbeddingModel.embedding.l2_distance(embedding))
                .limit(limit)
            )
            result = await session.execute(stmt)
            return [row[0] for row in result.all()]

    async def search_inner_product(self, embedding: list[float], limit: int = 10) -> list[int]:
        async with self.session_factory() as session:
            stmt = (
                select(ProductEmbeddingModel.product_id)
                .order_by(ProductEmbeddingModel.embedding.max_inner_product(embedding))
                .limit(limit)
            )
            result = await session.execute(stmt)
            return [row[0] for row in result.all()]
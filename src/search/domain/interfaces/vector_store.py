# search/domain/interfaces/vector_store.py

class VectorStore:
    async def add(self, id: int, embedding: list[float]) -> None:
        """
        Store a vector embedding for a product.
        """
        raise NotImplementedError

    async def search(self, embedding: list[float], limit: int = 10) -> list[int]:
        """
        Return a list of product IDs ranked by semantic similarity.
        """
        raise NotImplementedError

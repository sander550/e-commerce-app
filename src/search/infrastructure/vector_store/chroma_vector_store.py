# search/infrastructure/vector_store/chroma_vector_store.py


class ChromaVectorStore:
    def __init__(self, client):
        self.client = client
        self.collection = client.get_collection("products")

    async def add(self, id: int, embedding: list[float]):
        # Chroma expects strings for IDs
        self.collection.add(
            ids=[str(id)],
            embeddings=[embedding]
        )

    async def upsert(self, id: int, embedding: list[float]):
        self.collection.upsert(
            ids=[str(id)],
            embeddings=[embedding]
        )
        
    async def delete(self, id: int):
        self.collection.delete(ids=[str(id)])

    async def search(self, embedding: list[float], limit: int = 10) -> list[int]:
        try:
            results = self.collection.query(
                query_embeddings=[embedding],
                n_results=limit
            )
        except Exception as e:
            return []

        if "ids" not in results or not results["ids"]:
            return []

        try:
            ids = [int(x) for x in results["ids"][0]]
        except Exception as e:
            return []
        return ids


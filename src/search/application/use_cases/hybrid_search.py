class HybridSearchUseCase:
    def __init__(self, embedding_service, vector_store, product_repo):
        self.embedding_service = embedding_service
        self.vector_store = vector_store
        self.product_repo = product_repo

    async def execute(self, query: str):
        # 1. Embed query
        embedding = await self.embedding_service.embed(query)
        if not embedding:
            return []

        # 2. Semantic search
        semantic_ids = await self.vector_store.search(embedding, limit=10)

        # 3. Keyword search
        keyword_ids = await self.product_repo.search_keyword(query)

        # 4. Merge results (semantic first, then keyword)
        merged_ids = []
        seen = set()

        for pid in semantic_ids:
            if pid not in seen:
                merged_ids.append(pid)
                seen.add(pid)

        for pid in keyword_ids:
            if pid not in seen:
                merged_ids.append(pid)
                seen.add(pid)

        # 5. Fetch domain objects
        products = []
        for pid in merged_ids:
            product = await self.product_repo.get_by_id(pid)
            if product:
                products.append(product)

        return products

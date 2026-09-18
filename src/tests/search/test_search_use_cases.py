import pytest
from unittest.mock import AsyncMock, MagicMock

from search.application.use_cases.hybrid_search import HybridSearchUseCase


@pytest.mark.asyncio
async def test_hybrid_search():
    embedding_service = AsyncMock()
    vector_store = AsyncMock()
    product_repo = AsyncMock()

    product1 = MagicMock()
    product1.id = 1

    product2 = MagicMock()
    product2.id = 2

    product3 = MagicMock()
    product3.id = 3

    embedding_service.embed.return_value = [0.1, 0.2, 0.3]

    vector_store.search.return_value = [1, 2]

    product_repo.search_keyword.return_value = [2, 3]

    product_repo.get_by_id.side_effect = [
        product1,
        product2,
        product3,
    ]

    use_case = HybridSearchUseCase(
        embedding_service=embedding_service,
        vector_store=vector_store,
        product_repo=product_repo,
    )

    result = await use_case.execute("laptop")

    assert result == [
        product1,
        product2,
        product3,
    ]
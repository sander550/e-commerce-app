import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from search.infrastructure.vector_store.pgvector_store import PgVectorStore
from search.infrastructure.db.embedding_model import ProductEmbeddingModel


@pytest.fixture
def mock_session():
    return AsyncMock()


@pytest.fixture
def mock_session_factory(mock_session):
    factory = MagicMock()
    factory.return_value.__aenter__.return_value = mock_session
    factory.return_value.__aexit__.return_value = AsyncMock()
    return factory


class TestPgVectorStore:
    @pytest.mark.asyncio
    async def test_add(self, mock_session_factory):
        vector_store = PgVectorStore(session_factory=mock_session_factory)

        await vector_store.add(id=1, embedding=[0.1, 0.2, 0.3])

        mock_session_factory.return_value.__aenter__.return_value.add.assert_called_once()
        mock_session_factory.return_value.__aenter__.return_value.commit.assert_called_once()

        # Verify the model was created with correct data
        added_model = mock_session_factory.return_value.__aenter__.return_value.add.call_args[0][0]
        assert isinstance(added_model, ProductEmbeddingModel)
        assert added_model.product_id == 1
        assert added_model.embedding == [0.1, 0.2, 0.3]

    @pytest.mark.asyncio
    async def test_upsert(self, mock_session_factory):
        vector_store = PgVectorStore(session_factory=mock_session_factory)

        await vector_store.upsert(id=1, embedding=[0.1, 0.2, 0.3])

        mock_session_factory.return_value.__aenter__.return_value.execute.assert_called_once()
        mock_session_factory.return_value.__aenter__.return_value.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_delete(self, mock_session_factory):
        vector_store = PgVectorStore(session_factory=mock_session_factory)

        await vector_store.delete(id=1)

        mock_session_factory.return_value.__aenter__.return_value.execute.assert_called_once()
        mock_session_factory.return_value.__aenter__.return_value.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_search(self, mock_session_factory):
        # Mock the result
        mock_result = MagicMock()
        mock_result.all.return_value = [(1,), (2,), (3,)]
        mock_session_factory.return_value.__aenter__.return_value.execute.return_value = mock_result

        vector_store = PgVectorStore(session_factory=mock_session_factory)

        result = await vector_store.search(embedding=[0.1, 0.2, 0.3], limit=10)

        assert result == [1, 2, 3]
        mock_session_factory.return_value.__aenter__.return_value.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_search_empty_result(self, mock_session_factory):
        mock_result = MagicMock()
        mock_result.all.return_value = []
        mock_session_factory.return_value.__aenter__.return_value.execute.return_value = mock_result

        vector_store = PgVectorStore(session_factory=mock_session_factory)

        result = await vector_store.search(embedding=[0.1, 0.2, 0.3], limit=10)

        assert result == []
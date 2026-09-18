from unittest.mock import MagicMock

import pytest

from search.infrastructure.vector_store.chroma_vector_store import ChromaVectorStore


def test_add():
    client = MagicMock()
    collection = MagicMock()

    client.get_collection.return_value = collection

    vector_store = ChromaVectorStore(client)

    import asyncio

    asyncio.run(
        vector_store.add(
            id=1,
            embedding=[0.1, 0.2, 0.3],
        )
    )

    collection.add.assert_called_once_with(
        ids=["1"],
        embeddings=[[0.1, 0.2, 0.3]],
    )


def test_upsert():
    client = MagicMock()
    collection = MagicMock()

    client.get_collection.return_value = collection

    vector_store = ChromaVectorStore(client)

    import asyncio

    asyncio.run(
        vector_store.upsert(
            id=1,
            embedding=[0.1, 0.2, 0.3],
        )
    )

    collection.upsert.assert_called_once_with(
        ids=["1"],
        embeddings=[[0.1, 0.2, 0.3]],
    )


def test_delete():
    client = MagicMock()
    collection = MagicMock()

    client.get_collection.return_value = collection

    vector_store = ChromaVectorStore(client)

    import asyncio

    asyncio.run(
        vector_store.delete(id=1)
    )

    collection.delete.assert_called_once_with(
        ids=["1"],
    )


def test_search():
    client = MagicMock()
    collection = MagicMock()

    client.get_collection.return_value = collection

    collection.query.return_value = {
        "ids": [["1", "2", "3"]]
    }

    vector_store = ChromaVectorStore(client)

    import asyncio

    result = asyncio.run(
        vector_store.search(
            embedding=[0.1, 0.2, 0.3],
            limit=10,
        )
    )

    assert result == [1, 2, 3]

    collection.query.assert_called_once_with(
        query_embeddings=[[0.1, 0.2, 0.3]],
        n_results=10,
    )
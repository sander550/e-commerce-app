from fastapi import Depends

from core.application.providers.repo_provider import RepoProvider, get_provider
from core.infrastructure.ollama import OllamaClient

from search.domain.services.embedding_service import EmbeddingService
from search.infrastructure.vector_store.chroma_vector_store import ChromaVectorStore
from search.application.use_cases.hybrid_search import HybridSearchUseCase

from core.infrastructure.chroma_db import ChromaDBClient
from core.config.settings import settings


def get_search_use_case(
    provider: RepoProvider = Depends(get_provider)
) -> HybridSearchUseCase:

    ollama_client = OllamaClient()
    chroma_client = ChromaDBClient()

    embedding_service = EmbeddingService(ollama_client, settings.EMBEDDING_MODEL)

    return HybridSearchUseCase(
        embedding_service=embedding_service,
        vector_store=ChromaVectorStore(chroma_client),
        product_repo=provider.product_repo
    )

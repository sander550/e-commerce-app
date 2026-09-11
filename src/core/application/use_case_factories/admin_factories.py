from fastapi import Depends

from core.infrastructure.chroma_db import ChromaDBClient
from core.infrastructure.ollama import OllamaClient
from core.config.settings import settings

from src.admin.application.use_cases.create_product import CreateProductUseCase
from admin.application.use_cases.update_product import UpdateProductUseCase
from admin.application.use_cases.delete_product import DeleteProductUseCase

from admin.application.use_cases.create_category import CreateCategoryUseCase
from admin.application.use_cases.update_category import UpdateCategoryUseCase
from admin.application.use_cases.delete_category import DeleteCategoryUseCase

from admin.application.use_cases.update_order import UpdateOrderUseCase
from admin.application.use_cases.delete_order import DeleteOrderUseCase

from search.domain.services.embedding_service import EmbeddingService
from search.infrastructure.vector_store.chroma_vector_store import ChromaVectorStore
from core.application.providers.repo_provider import RepoProvider
from core.application.providers.repo_provider import get_provider


# -----------------------------
# PRODUCT USE CASE FACTORIES
# -----------------------------

def get_create_product_use_case(
    provider: RepoProvider = Depends(get_provider)
) -> CreateProductUseCase:

    chroma_client = ChromaDBClient()
    ollama_client = OllamaClient()

    return CreateProductUseCase(
        product_repo=provider.product_repo,
        category_repo=provider.category_repo,
        embedding_service=EmbeddingService(
            ollama_client=ollama_client,
            model_name=settings.EMBEDDING_MODEL
        ),
        vector_store=ChromaVectorStore(chroma_client)
    )


def get_update_product_use_case(
    provider: RepoProvider = Depends(get_provider)
) -> UpdateProductUseCase:

    chroma_client = ChromaDBClient()
    ollama_client = OllamaClient()

    return UpdateProductUseCase(
        product_repo=provider.product_repo,
        category_repo=provider.category_repo,
        embedding_service=EmbeddingService(
            ollama_client=ollama_client,
            model_name=settings.EMBEDDING_MODEL
        ),
        vector_store=ChromaVectorStore(chroma_client)
    )


def get_delete_product_use_case(
    provider: RepoProvider = Depends(get_provider)
) -> DeleteProductUseCase:

    chroma_client = ChromaDBClient()

    return DeleteProductUseCase(
        product_repo=provider.product_repo,
        vector_store=ChromaVectorStore(chroma_client)
    )


# -----------------------------
# CATEGORY USE CASE FACTORIES
# -----------------------------

def get_create_category_use_case(
    provider: RepoProvider = Depends(get_provider)
) -> CreateCategoryUseCase:
    return CreateCategoryUseCase(
        category_repo=provider.category_repo
    )


def get_update_category_use_case(
    provider: RepoProvider = Depends(get_provider)
) -> UpdateCategoryUseCase:
    return UpdateCategoryUseCase(
        category_repo=provider.category_repo
    )


def get_delete_category_use_case(
    provider: RepoProvider = Depends(get_provider)
) -> DeleteCategoryUseCase:
    return DeleteCategoryUseCase(
        category_repo=provider.category_repo
    )


def get_update_order_use_case(
    provider: RepoProvider = Depends(get_provider)
) -> UpdateOrderUseCase:
    return UpdateOrderUseCase(
        order_repo=provider.order_repo
    )



def get_delete_order_use_case(
    provider: RepoProvider = Depends(get_provider)
) -> DeleteOrderUseCase:
    return DeleteOrderUseCase(
        order_repo=provider.order_repo
    )

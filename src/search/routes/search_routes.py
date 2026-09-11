# search/routes/search_routes.py
from fastapi import APIRouter, Depends
from search.application.use_cases.hybrid_search import HybridSearchUseCase
from core.application.use_case_factories.search_factories import get_search_use_case
from search.application.dto.search_dtos import MessageDTO


router = APIRouter(prefix="/search", tags=["search"])


@router.get("/")
async def search_products(q: str, use_case:
    HybridSearchUseCase = Depends(get_search_use_case)):
    try:
        products = await use_case.execute(query=q)
    except Exception as e:
        return MessageDTO.from_message(str(e))
    return products

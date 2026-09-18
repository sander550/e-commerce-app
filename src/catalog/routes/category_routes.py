from catalog.application.use_cases.list_categories import ListCategoriesUseCase
from fastapi import APIRouter, Depends
from core.application.use_case_factories.catalog_factories import get_list_categories_use_case

router = APIRouter(prefix="/categories", tags=["Categories"])

@router.get("/")
async def list_categories(use_case: ListCategoriesUseCase = Depends(get_list_categories_use_case)):
    try:
        categories = await use_case.execute()
    except Exception as e:
        return {"error": str(e)}
    return {"categories": categories}



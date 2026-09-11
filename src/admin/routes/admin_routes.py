from fastapi import APIRouter, Depends, HTTPException
from admin.application.dto.admin_dto import (CreateProductDTO, UpdateProductDTO,
                                             CreateCategoryDTO, UpdateCategoryDTO,
                                             UpdateOrderDTO
                                             )

from admin.application.use_cases.create_product import CreateProductUseCase
from admin.application.use_cases.update_product import UpdateProductUseCase
from admin.application.use_cases.delete_product import DeleteProductUseCase
from admin.application.use_cases.update_category import UpdateCategoryUseCase
from admin.application.use_cases.create_category import CreateCategoryUseCase
from admin.application.use_cases.delete_category import DeleteCategoryUseCase
from admin.application.use_cases.update_order import UpdateOrderUseCase
from admin.application.use_cases.delete_order import DeleteOrderUseCase


from core.application.use_case_factories.admin_factories import (
    get_create_product_use_case,
    get_update_product_use_case,
    get_delete_product_use_case,
    get_update_category_use_case,
    get_delete_category_use_case,
    get_create_category_use_case,
    get_update_order_use_case,
    get_delete_order_use_case

)
from core.security.dependencies import admin_required

router = APIRouter(prefix="/admin", tags=["Admin"])

# -------------------------
# PRODUCT ROUTES
# -------------------------

@router.post("/product", dependencies=[Depends(admin_required)])
async def create_product(
    dto: CreateProductDTO,
    use_case: CreateProductUseCase = Depends(get_create_product_use_case),
):
    try:
        return await use_case.execute(
            name=dto.name,
            description=dto.description,
            price=dto.price,
            stock=dto.stock,
            category_id=dto.category_id,
            image_url=dto.image_url
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/product/{product_id}", dependencies=[Depends(admin_required)])
async def update_product(
    product_id: int,
    dto: UpdateProductDTO,
    use_case: UpdateProductUseCase = Depends(get_update_product_use_case)
):
    try:
        return await use_case.execute(
            product_id=product_id,
            name=dto.name,
            description=dto.description,
            price=dto.price,
            stock=dto.stock,
            category_id=dto.category_id,
            image_url=dto.image_url,
            is_active=dto.is_active
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/product/{product_id}", dependencies=[Depends(admin_required)])
async def delete_product(
    product_id: int,
    use_case: DeleteProductUseCase = Depends(get_delete_product_use_case)
):
    try:
        await use_case.execute(product_id)
        return {"status": "deleted"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# -------------------------
# CATEGORY ROUTES
# -------------------------

@router.post("/category", dependencies=[Depends(admin_required)])
async def create_category(
    dto: CreateCategoryDTO,
    use_case: CreateCategoryUseCase = Depends(get_create_category_use_case)
):
    try:
        return await use_case.execute(
            name=dto.name,
            parent_id=dto.parent_id
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/category/{category_id}", dependencies=[Depends(admin_required)])
async def update_category(
    category_id: int,
    dto: UpdateCategoryDTO,
    use_case: UpdateCategoryUseCase = Depends(get_update_category_use_case)
):
    try:
        return await use_case.execute(
            category_id=category_id,
            name=dto.name,
            parent_id=dto.parent_id
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/category/{category_id}", dependencies=[Depends(admin_required)])
async def delete_category(
    category_id: int,
    use_case: DeleteCategoryUseCase = Depends(get_delete_category_use_case)
):
    try:
        await use_case.execute(category_id)
        return {"status": "deleted"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

# -------------------------
# ORDER ROUTES
# -------------------------


@router.put("/order/{order_id}", dependencies=[Depends(admin_required)])
async def update_order(
    order_id: int,
    dto: UpdateOrderDTO,
    use_case: UpdateOrderUseCase = Depends(get_update_order_use_case)
):
    try:
        return await use_case.execute(
            order_id=order_id,
            status=dto.status,
            shipping_address=dto.shipping_address,
            delivery_method=dto.delivery_method,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/order/{order_id}", dependencies=[Depends(admin_required)])
async def delete_order(
    order_id: int,
    use_case: DeleteOrderUseCase = Depends(get_delete_order_use_case)
):
    try:
        await use_case.execute(order_id)
        return {"status": "deleted"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
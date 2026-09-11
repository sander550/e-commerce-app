from fastapi import APIRouter, Depends, HTTPException
from core.security.dependencies import auth_required

from cart.application.use_cases.get_cart import GetCartUseCase
from cart.application.use_cases.clear_cart import ClearCartUseCase
from cart.application.use_cases.calculate_cart_totals import CalculateCartTotalsUseCase
from cart.application.use_cases.remove_cart_item import RemoveCartItemUseCase
from cart.application.use_cases.update_cart_item_quantity import UpdateCartItemQuantityUseCase
from cart.application.use_cases.add_item_to_cart import AddItemToCartUseCase

from core.application.use_case_factories.cart_factories import (
    get_add_item_use_case,
    get_remove_item_use_case,
    get_update_quantity_use_case,
    get_clear_cart_use_case,
    get_cart_use_case,
    get_cart_totals_use_case
)

from fastapi import APIRouter, Depends
from cart.application.dto.cart_dto import (
    CartResponseDTO,
    CartTotalsResponseDTO,
    AddItemToCartDTO,
    UpdateQuantityDTO
)
router = APIRouter(prefix="/cart", tags=["Cart"])


# ---------------------------------------------------------
# GET CART
# ---------------------------------------------------------
@router.get("/", response_model=CartResponseDTO)
async def get_cart(
    user=Depends(auth_required),
    use_case: GetCartUseCase = Depends(get_cart_use_case)
):
    try:
        cart = await use_case.execute(user.id)
        return CartResponseDTO.from_domain(cart)
    except Exception as e:

        raise HTTPException(400, str(e))


# ---------------------------------------------------------
# ADD ITEM TO CART
# ---------------------------------------------------------
@router.post("/add", response_model=CartResponseDTO)
async def add_item(
    dto: AddItemToCartDTO,
    user=Depends(auth_required),
    use_case: AddItemToCartUseCase = Depends(get_add_item_use_case)
):
    try:
        cart = await use_case.execute(
            user_id=user.id,
            product_id=dto.product_id,
            quantity=dto.quantity
        )

        return CartResponseDTO.from_domain(cart)
    except Exception as e:
        raise HTTPException(400, str(e))


# ---------------------------------------------------------
# REMOVE ITEM FROM CART
# ---------------------------------------------------------
@router.delete("/item/{product_id}", response_model=CartResponseDTO)
async def remove_item(
    product_id: int,
    user=Depends(auth_required),
    use_case: RemoveCartItemUseCase = Depends(get_remove_item_use_case)
):
    try:
        cart = await use_case.execute(user.id, product_id)
        return CartResponseDTO.from_domain(cart)
    except Exception as e:
        raise HTTPException(400, str(e))


# ---------------------------------------------------------
# UPDATE ITEM QUANTITY
# ---------------------------------------------------------
@router.put("/item/{product_id}", response_model=CartResponseDTO)
async def update_item_quantity(
    product_id: int,
    dto: UpdateQuantityDTO,
    user=Depends(auth_required),
    use_case: UpdateCartItemQuantityUseCase = Depends(get_update_quantity_use_case)
):
    try:
        cart = await use_case.execute(
            user_id=user.id,
            product_id=product_id,
            quantity=dto.quantity
        )
        return CartResponseDTO.from_domain(cart)
    except Exception as e:
        raise HTTPException(400, str(e))


# ---------------------------------------------------------
# CLEAR CART
# ---------------------------------------------------------
@router.post("/clear")
async def clear_cart(
    user=Depends(auth_required),
    use_case: ClearCartUseCase = Depends(get_clear_cart_use_case)
):
    try:
        await use_case.execute(user.id)
        return {"message": "Cart cleared"}
    except Exception as e:
        raise HTTPException(400, str(e))


# ---------------------------------------------------------
# CART TOTALS
# ---------------------------------------------------------
@router.get("/totals", response_model=CartTotalsResponseDTO)
async def get_cart_totals(
    user=Depends(auth_required),
    use_case: CalculateCartTotalsUseCase = Depends(get_cart_totals_use_case)
):
    try:
        totals = await use_case.execute(user.id)
        return CartTotalsResponseDTO.from_domain(totals)
    except Exception as e:
        raise HTTPException(400, str(e))

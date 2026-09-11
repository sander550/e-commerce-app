from pydantic import BaseModel
from typing import Optional


# -------------------------
# PRODUCT DTOs
# -------------------------

class CreateProductDTO(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    stock: int
    category_id: int
    image_url: Optional[str] = None


class UpdateProductDTO(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    category_id: Optional[int] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None


# -------------------------
# CATEGORY DTOs
# -------------------------

class CreateCategoryDTO(BaseModel):
    name: str
    parent_id: Optional[int] = None


class UpdateCategoryDTO(BaseModel):
    name: Optional[str] = None
    parent_id: Optional[int] = None


# -------------------------
# ORDER DTOs
# -------------------------

class UpdateOrderDTO(BaseModel):
    status: Optional[str] = None
    shipping_address: Optional[str] = None
    delivery_method: Optional[str] = None
    tracking_number: Optional[str] = None


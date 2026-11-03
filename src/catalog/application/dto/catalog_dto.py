from dataclasses import dataclass
from typing import Optional

@dataclass
class CategoryResponseDTO:
    id: int
    name: str
    parent_id: Optional[int]

    @staticmethod
    def from_domain(category):
        return CategoryResponseDTO(
            id=category.id,
            name=category.name,
            parent_id=category.parent_id
        )



@dataclass
class ProductResponseDTO:
    id: int
    name: str
    description: Optional[str]
    price: float
    stock: int
    category_id: int
    image_url: Optional[str]
    is_active: bool

    @staticmethod
    def from_domain(product):
        return ProductResponseDTO(
            id=product.id,
            name=product.name,
            description=product.description,
            price=product.price,
            stock=product.stock,
            category_id=product.category_id,
            image_url=product.image_url,
            is_active=product.is_active
        )
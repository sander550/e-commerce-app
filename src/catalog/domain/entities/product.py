# src/catalog/domain/entities/product.py

from dataclasses import dataclass
from typing import Optional

@dataclass
class Product:
    name: str
    description: Optional[str]
    price: float
    stock: int
    category_id: int
    image_url: Optional[str] = None
    is_active: bool = True
    id: Optional[int] = None

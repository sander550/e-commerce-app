from dataclasses import dataclass
from typing import Optional


@dataclass
class Category:
    id: int
    name: str
    parent_id: Optional[int] = None

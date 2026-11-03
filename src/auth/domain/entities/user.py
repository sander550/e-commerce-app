from dataclasses import dataclass
from typing import Optional
from datetime import datetime


@dataclass
class User:
    id: Optional[int]
    email: str
    hashed_password: str
    is_admin: bool
    is_active: bool
    created_at: datetime

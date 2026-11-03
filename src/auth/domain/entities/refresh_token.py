from dataclasses import dataclass
from typing import Optional
from datetime import datetime


@dataclass
class RefreshToken:
    id: Optional[int]
    user_id: int
    token: str
    expires_at: datetime
    created_at: datetime
    revoked: bool = False

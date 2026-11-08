from abc import ABC, abstractmethod
from typing import Optional
from auth.domain.entities.refresh_token import RefreshToken


class IRefreshTokenRepository(ABC):

    @abstractmethod
    async def get_by_token(self, token: str) -> Optional[RefreshToken]:
        pass

    @abstractmethod
    async def create(self, token: RefreshToken) -> RefreshToken:
        pass

    @abstractmethod
    async def delete(self, token_id: int) -> None:
        pass

    @abstractmethod
    async def delete_all_for_user(self, user_id: int) -> None:
        pass

    @abstractmethod
    async def revoke(self, token_id: int) -> None:
        pass

    @abstractmethod
    async def rotate_refresh_token(self, old_token: RefreshToken) -> tuple[str, RefreshToken]:
        """Rotate a refresh token: revoke old and create new one. Returns (raw_token, new_entity)."""
        pass
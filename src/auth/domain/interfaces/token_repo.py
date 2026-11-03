from abc import ABC, abstractmethod
from typing import Optional
from auth.domain.entities.refresh_token import RefreshToken


class IRefreshTokenRepository(ABC):

    @abstractmethod
    def get_by_token(self, token: str) -> Optional[RefreshToken]:
        ...

    @abstractmethod
    def create(self, token: RefreshToken) -> RefreshToken:
        ...

    @abstractmethod
    def delete(self, token_id: int) -> None:
        ...

    @abstractmethod
    def delete_all_for_user(self, user_id: int) -> None:
        ...

    @abstractmethod
    def revoke(self, token_id: int) -> None:
        ...

from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from auth.domain.entities.user import User
from auth.infrastructure.db.user_model import UserModel
from auth.domain.interfaces.user_repo import IUserRepository


class UserRepository(IUserRepository):

    def __init__(self, db: AsyncSession):
        self.db = db

    # ---------------------------------------------------------
    # INTERNAL MAPPER
    # ---------------------------------------------------------
    def _to_domain(self, model: UserModel) -> User:
        return User(
            id=model.id,
            email=model.email,
            hashed_password=model.hashed_password,
            is_admin=model.is_admin,
            created_at=model.created_at,
            is_active=model.is_active,
        )

    # ---------------------------------------------------------
    # GET BY ID
    # ---------------------------------------------------------
    async def get_by_id(self, user_id: int) -> Optional[User]:
        result = await self.db.execute(
            select(UserModel).where(UserModel.id == user_id)
        )
        model = result.scalar_one_or_none()
        return self._to_domain(model) if model else None

    # ---------------------------------------------------------
    # GET BY EMAIL
    # ---------------------------------------------------------
    async def get_by_email(self, email: str) -> Optional[User]:
        result = await self.db.execute(
            select(UserModel).where(UserModel.email == email)
        )
        model = result.scalar_one_or_none()
        return self._to_domain(model) if model else None

    # ---------------------------------------------------------
    # CREATE USER
    # ---------------------------------------------------------
    async def create(self, user: User) -> User:
        model = UserModel(
            email=user.email,
            hashed_password=user.hashed_password,
            is_admin=user.is_admin,
            is_active=user.is_active,
            created_at=user.created_at,
        )

        self.db.add(model)
        await self.db.commit()
        await self.db.refresh(model)

        return self._to_domain(model)

    # ---------------------------------------------------------
    # UPDATE USER
    # ---------------------------------------------------------
    async def update(self, user: User) -> Optional[User]:
        result = await self.db.execute(
            select(UserModel).where(UserModel.id == user.id)
        )
        model = result.scalar_one_or_none()
        if not model:
            return None

        model.email = user.email
        model.hashed_password = user.hashed_password
        model.is_active = user.is_active

        await self.db.commit()
        await self.db.refresh(model)

        return self._to_domain(model)
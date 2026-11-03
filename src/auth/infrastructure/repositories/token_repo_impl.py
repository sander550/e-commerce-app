from typing import Optional
from sqlalchemy import select, delete, update
from sqlalchemy.ext.asyncio import AsyncSession

from auth.infrastructure.helpers.token_hash import hash_token
from auth.infrastructure.helpers.refresh_token_generator import generate_refresh_token
from auth.domain.entities.refresh_token import RefreshToken
from auth.domain.interfaces.token_repo import IRefreshTokenRepository
from auth.infrastructure.db.token_model import RefreshTokenModel


class TokenRepository(IRefreshTokenRepository):

    def __init__(self, session: AsyncSession):
        self.session = session

    # ---------------------------------------------------------
    # INTERNAL MAPPER
    # ---------------------------------------------------------
    def _to_domain(self, model: RefreshTokenModel) -> RefreshToken:
        return RefreshToken(
            id=model.id,
            user_id=model.user_id,
            token=model.token,
            expires_at=model.expires_at,
            created_at=model.created_at,
            revoked=model.revoked,
        )

    # ---------------------------------------------------------
    # FIND BY TOKEN
    # ---------------------------------------------------------
    async def get_by_token(self, raw_token: str) -> Optional[RefreshToken]:
        if not raw_token:
            return None

        hashed = hash_token(raw_token)

        result = await self.session.execute(
            select(RefreshTokenModel).where(
                RefreshTokenModel.token == hashed,
                RefreshTokenModel.revoked == False
            )
        )

        model = result.scalar_one_or_none()
        return self._to_domain(model) if model else None

    # ---------------------------------------------------------
    # CREATE TOKEN
    # ---------------------------------------------------------
    async def create(self, token: RefreshToken) -> RefreshToken:
        model = RefreshTokenModel(
            user_id=token.user_id,
            token=token.token,
            expires_at=token.expires_at,
        )

        self.session.add(model)
        await self.session.commit()
        await self.session.refresh(model)

        return self._to_domain(model)

    # ---------------------------------------------------------
    # DELETE TOKEN BY ID
    # ---------------------------------------------------------
    async def delete(self, token_id: int) -> None:
        await self.session.execute(
            delete(RefreshTokenModel).where(RefreshTokenModel.id == token_id)
        )
        await self.session.commit()

    # ---------------------------------------------------------
    # DELETE ALL TOKENS FOR USER
    # ---------------------------------------------------------
    async def delete_all_for_user(self, user_id: int) -> None:
        await self.session.execute(
            delete(RefreshTokenModel).where(RefreshTokenModel.user_id == user_id)
        )
        await self.session.commit()

    # ---------------------------------------------------------
    # REVOKE TOKEN
    # ---------------------------------------------------------
    async def revoke(self, token_id: int) -> None:
        await self.session.execute(
            update(RefreshTokenModel)
            .where(RefreshTokenModel.id == token_id)
            .values(revoked=True)
        )
        await self.session.commit()

    # ---------------------------------------------------------
    # ROTATE TOKEN
    # ---------------------------------------------------------
    async def rotate_refresh_token(self, old_token: RefreshToken):
        # 1. Load old token
        await self.revoke(old_token.id)

        # 2. Generate new raw token
        new_entity = generate_refresh_token(old_token.user_id)
        new_raw = new_entity.token

        # 3. Hash before storing
        hashed = hash_token(new_raw)

        # 4. Store new token
        db_new = RefreshTokenModel(
            user_id=new_entity.user_id,
            token=hashed,
            expires_at=new_entity.expires_at,
            created_at=new_entity.created_at,
            revoked=False,
        )

        self.session.add(db_new)
        await self.session.commit()
        await self.session.refresh(db_new)

        # 5. Update domain entity
        new_entity.id = db_new.id

        return new_raw, new_entity

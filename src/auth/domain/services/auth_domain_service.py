from datetime import timedelta
import secrets
from auth.domain.entities.refresh_token import RefreshToken
from auth.domain.rules.password_rules import validate_password_strength
from auth.domain.rules.token_rules import is_token_expired
from jose import jwt, JWTError
from datetime import datetime
from core.config.settings import settings

class AuthDomainService:

    async def validate_new_user(self, password: str):
        if not await validate_password_strength(password):
            raise Exception("Password strength error")



    async def verify_access_token(self, token: str) -> dict | None:
        if not token:
            return None

        try:
            payload = jwt.decode(
                token,
                settings.JWT_SECRET,
                algorithms=[settings.JWT_ALGORITHM]
            )

            # Business rule: token must not be expired
            exp = payload.get("exp")
            if exp and datetime.utcnow().timestamp() > exp:
                return None

            # Business rule: token must contain user_id
            user_id = payload.get("sub")
            if not user_id:
                return None

            return {"user_id": int(user_id)}

        except JWTError:
            return None

    async def validate_refresh_token(self, token: RefreshToken | None):
        # Business rule: token must exist
        if token is None:
            raise ValueError("Token not found")

        # Business rule: token must not be revoked
        if token.revoked:
            raise ValueError("Token revoked")

        # Business rule: token must not be expired
        if await is_token_expired(token.expires_at):
            raise ValueError("Token expired")

        return True
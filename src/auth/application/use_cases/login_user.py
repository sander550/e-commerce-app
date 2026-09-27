from auth.domain.interfaces.user_repo import IUserRepository
from auth.domain.interfaces.token_repo import IRefreshTokenRepository
from auth.domain.services.auth_domain_service import AuthDomainService
from auth.infrastructure.helpers.jwt import create_access_token
from auth.infrastructure.helpers.password_hash import verify_password
from auth.infrastructure.helpers.refresh_token_generator import generate_refresh_token
from auth.infrastructure.helpers.token_hash import hash_token
from auth.domain.entities.refresh_token import RefreshToken
from core.security.rate_limiting_service import RedisRateLimitService


class LoginUserUseCase:

    def __init__(
            self,
            user_repo: IUserRepository,
            token_repo: IRefreshTokenRepository,
            domain: AuthDomainService,
            rate_limiter: RedisRateLimitService,
    ):
        self.user_repo = user_repo
        self.token_repo = token_repo
        self.domain = domain
        self.rate_limiter = rate_limiter

    async def execute(
            self,
            email: str,
            password: str,
            ip: str,
    ):
        # Check login email rate limit
        email_allowed = await self.rate_limiter.check_login_user_limit(email)

        if not email_allowed:
            raise ValueError(
                "Too many login attempts for this account. "
                "Please try again later.")

        # Check login IP rate limit
        ip_allowed = await self.rate_limiter.check_login_ip_limit(ip)

        if not ip_allowed:
            raise ValueError(
                "Too many login attempts from this IP. "
                "Please try again later.")

        user = await self.user_repo.get_by_email(email)

        if not user:
            raise ValueError("Invalid credentials")

        if not verify_password(
                password,
                user.hashed_password,
        ):
            raise ValueError("Invalid credentials")

        # ACCESS TOKEN
        access_token = create_access_token(
            {"sub": str(user.id)}
        )

        # REFRESH TOKEN (RAW)
        raw_refresh = generate_refresh_token(user.id)

        # HASHED VERSION FOR DB
        hashed_token = hash_token(
            raw_refresh.token
        )

        # CREATE DB ENTITY WITH HASHED TOKEN
        db_entity = RefreshToken(
            id=None,
            user_id=user.id,
            token=hashed_token,
            expires_at=raw_refresh.expires_at,
            created_at=raw_refresh.created_at,
            revoked=False,
        )

        # STORE HASHED VERSION
        await self.token_repo.create(db_entity)

        # RETURN RAW VERSION TO FRONTEND
        return {
            "access_token": access_token,
            "refresh_token": raw_refresh.token,
            "user": user,
        }

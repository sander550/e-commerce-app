from datetime import datetime
from auth.domain.entities.user import User
from auth.domain.interfaces.user_repo import IUserRepository
from auth.domain.interfaces.token_repo import IRefreshTokenRepository
from auth.domain.services.auth_domain_service import AuthDomainService
from auth.infrastructure.helpers.jwt import create_access_token
from auth.infrastructure.helpers.refresh_token_generator import generate_refresh_token
from auth.infrastructure.helpers.password_hash import hash_password

from auth.infrastructure.helpers.token_hash import hash_token
from auth.domain.entities.refresh_token import RefreshToken

class RegisterUserUseCase:

    def __init__(
        self,
        user_repo: IUserRepository,
        token_repo: IRefreshTokenRepository,
        domain: AuthDomainService,
    ):
        self.user_repo = user_repo
        self.token_repo = token_repo
        self.domain = domain

    async def execute(self, email: str, password: str):
        # Check if email exists
        if await self.user_repo.get_by_email(email):
            raise ValueError("Email already exists")

        # Validate password strength
        await self.domain.validate_new_user(password)

        # Hash password
        hashed = hash_password(password)

        # Create user entity
        user = User(
            id=None,
            email=email,
            hashed_password=hashed,
            is_admin=False,
            is_active=True,
            created_at=datetime.utcnow()
        )

        # Save user
        user = await self.user_repo.create(user)

        # ACCESS TOKEN
        access_token = create_access_token({"sub": str(user.id)})

        # REFRESH TOKEN (RAW)
        raw_refresh = generate_refresh_token(user.id)

        # HASHED VERSION FOR DB
        hashed_token = hash_token(raw_refresh.token)

        # Create DB entity with hashed token
        db_entity = RefreshToken(
            id=None,
            user_id=user.id,
            token=hashed_token,
            expires_at=raw_refresh.expires_at,
            created_at=raw_refresh.created_at,
            revoked=False,
        )

        # Store hashed version
        await self.token_repo.create(db_entity)

        # Return RAW version to frontend
        return {
            "access_token": access_token,
            "refresh_token": raw_refresh.token,  # RAW TOKEN
            "user": user,
        }

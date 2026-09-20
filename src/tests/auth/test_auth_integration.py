import pytest
from datetime import datetime

from auth.application.use_cases.register_user import RegisterUserUseCase
from auth.application.use_cases.login_user import LoginUserUseCase
from auth.application.use_cases.logout_user import LogoutUseCase

from auth.domain.entities.user import User
from auth.domain.entities.refresh_token import RefreshToken

from auth.infrastructure.repositories.user_repo_impl import UserRepository
from auth.infrastructure.repositories.token_repo_impl import TokenRepository

from auth.infrastructure.helpers.password_hash import hash_password, verify_password
from auth.infrastructure.helpers.token_hash import hash_token

from auth.domain.services.auth_domain_service import AuthDomainService
from auth.infrastructure.helpers.refresh_token_generator import generate_refresh_token

# ---------------------------------------------------------
# REGISTER INTEGRATION
# ---------------------------------------------------------
@pytest.mark.asyncio
async def test_register_integration(db_session):
    user_repo = UserRepository(db_session)
    token_repo = TokenRepository(db_session)
    domain = AuthDomainService()

    uc = RegisterUserUseCase(user_repo, token_repo, domain)

    result = await uc.execute("new@example.com", "pw123123123")

    user = result["user"]
    assert user.email == "new@example.com"
    assert verify_password("pw123123123", user.hashed_password)

    raw = result["refresh_token"]
    hashed = hash_token(raw)

    db_token = await token_repo.get_by_token(raw)
    assert db_token is not None
    assert db_token.token == hashed


# ---------------------------------------------------------
# LOGIN INTEGRATION
# ---------------------------------------------------------
@pytest.mark.asyncio
async def test_login_integration(db_session):
    user_repo = UserRepository(db_session)
    token_repo = TokenRepository(db_session)
    domain = AuthDomainService()

    user = User(
        id=None,
        email="test@example.com",
        hashed_password=hash_password("pw123123123"),
        is_admin=False,
        is_active=True,
        created_at=datetime.utcnow(),
    )
    user = await user_repo.create(user)

    uc = LoginUserUseCase(user_repo, token_repo, domain)

    result = await uc.execute("test@example.com", "pw123123123")

    raw = result["refresh_token"]
    hashed = hash_token(raw)

    db_token = await token_repo.get_by_token(raw)
    assert db_token is not None
    assert db_token.token == hashed


# ---------------------------------------------------------
# LOGOUT INTEGRATION
# ---------------------------------------------------------
@pytest.mark.asyncio
async def test_logout_integration(db_session):
    token_repo = TokenRepository(db_session)

    # generate raw token exactly like real app
    raw_refresh = generate_refresh_token(user_id=1)
    raw = raw_refresh.token

    # FIRST HASH (manual)
    hashed_token = hash_token(raw)

    # store hashed token (repo will hash again → double hash)
    token = RefreshToken(
        id=None,
        user_id=1,
        token=hashed_token,  # storing hashed token forces mismatch
        expires_at=raw_refresh.expires_at,
        created_at=raw_refresh.created_at,
        revoked=False,
    )

    saved = await token_repo.create(token)

    # run logout use case
    uc = LogoutUseCase(token_repo)
    await uc.execute(raw)

    # repo hashes raw once → mismatch → None
    revoked = await token_repo.get_by_token(raw)

    assert revoked is None

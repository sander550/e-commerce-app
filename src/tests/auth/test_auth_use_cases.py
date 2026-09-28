import pytest
from datetime import datetime
from unittest.mock import AsyncMock

from auth.application.use_cases.register_user import RegisterUserUseCase
from auth.application.use_cases.login_user import LoginUserUseCase
from auth.application.use_cases.logout_user import LogoutUseCase

from auth.domain.entities.user import User
from auth.domain.entities.refresh_token import RefreshToken

from auth.domain.services.auth_domain_service import AuthDomainService

from auth.infrastructure.helpers.password_hash import (
    hash_password,
)
from auth.infrastructure.helpers.token_hash import (
    hash_token,
)

from core.security.rate_limiting_service import RedisRateLimitService


# ---------------------------------------------------------
# MOCK USER
# ---------------------------------------------------------
def mock_user():
    return User(
        id=1,
        email="test@example.com",
        hashed_password=hash_password("pw123"),
        is_admin=False,
        is_active=True,
        created_at=datetime.utcnow(),
    )


# ---------------------------------------------------------
# REGISTER USE CASE
# ---------------------------------------------------------
@pytest.mark.asyncio
async def test_register_success():
    user_repo = AsyncMock()
    token_repo = AsyncMock()
    domain = AsyncMock()

    # Email does not already exist
    user_repo.get_by_email.return_value = None

    # Simulate database creating the user
    user_repo.create.return_value = mock_user()

    uc = RegisterUserUseCase(
        user_repo,
        token_repo,
        domain,
    )

    result = await uc.execute(
        "new@example.com",
        "pw123",
    )

    # Check returned data
    assert "access_token" in result
    assert "refresh_token" in result
    assert result["user"].email == "test@example.com"

    # Password validation was called
    domain.validate_new_user.assert_called_once_with(
        "pw123"
    )

    # Refresh token was stored
    token_repo.create.assert_called_once()

    args, kwargs = token_repo.create.call_args
    saved_token: RefreshToken = args[0]

    assert saved_token.user_id == 1

    assert saved_token.token == hash_token(
        result["refresh_token"]
    )


# ---------------------------------------------------------
# LOGIN USE CASE
# ---------------------------------------------------------
@pytest.mark.asyncio
async def test_login_success():
    user_repo = AsyncMock()
    token_repo = AsyncMock()
    domain = AuthDomainService()

    # Mock Redis rate limiter
    rate_limiter = AsyncMock(
        spec=RedisRateLimitService
    )

    # Allow both login limits
    rate_limiter.check_login_user_limit.return_value = True
    rate_limiter.check_login_ip_limit.return_value = True

    # Simulate existing user
    user_repo.get_by_email.return_value = mock_user()

    uc = LoginUserUseCase(
        user_repo,
        token_repo,
        domain,
        rate_limiter,
    )

    result = await uc.execute(
        "test@example.com",
        "pw123",
        "127.0.0.1",
    )

    # Check returned data
    assert "access_token" in result
    assert "refresh_token" in result
    assert result["user"].email == "test@example.com"

    # Check account rate limit
    rate_limiter.check_login_user_limit.assert_awaited_once_with(
        "test@example.com"
    )

    # Check IP rate limit
    rate_limiter.check_login_ip_limit.assert_awaited_once_with(
        "127.0.0.1"
    )

    # Check user lookup
    user_repo.get_by_email.assert_awaited_once_with(
        "test@example.com"
    )

    # Check refresh token was saved
    token_repo.create.assert_awaited_once()

    args, kwargs = token_repo.create.call_args
    saved_token: RefreshToken = args[0]

    assert saved_token.user_id == 1

    assert saved_token.token == hash_token(
        result["refresh_token"]
    )


# ---------------------------------------------------------
# LOGOUT USE CASE
# ---------------------------------------------------------
@pytest.mark.asyncio
async def test_logout_success():
    token_repo = AsyncMock()

    # Simulate existing refresh token
    token_repo.get_by_token.return_value = RefreshToken(
        id=10,
        user_id=1,
        token="hashed123",
        expires_at=datetime.utcnow(),
        created_at=datetime.utcnow(),
        revoked=False,
    )

    uc = LogoutUseCase(token_repo)

    await uc.execute("rawtoken123")

    # Only this token should be revoked
    token_repo.revoke.assert_awaited_once_with(10)
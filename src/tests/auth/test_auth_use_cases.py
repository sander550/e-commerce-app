import pytest
from unittest.mock import AsyncMock

from auth.application.use_cases.login_user import LoginUserUseCase
from auth.application.use_cases.register_user import RegisterUserUseCase
from auth.application.use_cases.logout_user import LogoutUseCase

from auth.domain.entities.user import User
from auth.domain.entities.refresh_token import RefreshToken

from auth.infrastructure.helpers.password_hash import hash_password, verify_password
from auth.infrastructure.helpers.token_hash import hash_token

from datetime import datetime


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
# LOGIN USE CASE
# ---------------------------------------------------------
@pytest.mark.asyncio
async def test_login_success():
    user_repo = AsyncMock()
    token_repo = AsyncMock()
    domain = AsyncMock()

    user_repo.get_by_email.return_value = mock_user()

    uc = LoginUserUseCase(user_repo, token_repo, domain)

    result = await uc.execute("test@example.com", "pw123")

    assert "access_token" in result
    assert "refresh_token" in result
    assert result["user"].email == "test@example.com"

    # token_repo.create should be called with hashed token
    args, kwargs = token_repo.create.call_args
    saved_token: RefreshToken = args[0]

    assert saved_token.user_id == 1
    assert saved_token.token != result["refresh_token"]  # hashed vs raw
    assert saved_token.token == hash_token(result["refresh_token"])


@pytest.mark.asyncio
async def test_login_invalid_email():
    user_repo = AsyncMock()
    token_repo = AsyncMock()
    domain = AsyncMock()

    user_repo.get_by_email.return_value = None

    uc = LoginUserUseCase(user_repo, token_repo, domain)

    with pytest.raises(ValueError):
        await uc.execute("wrong@example.com", "pw123")


@pytest.mark.asyncio
async def test_login_invalid_password():
    user_repo = AsyncMock()
    token_repo = AsyncMock()
    domain = AsyncMock()

    bad_user = mock_user()
    bad_user.hashed_password = hash_password("different_pw")

    user_repo.get_by_email.return_value = bad_user

    uc = LoginUserUseCase(user_repo, token_repo, domain)

    with pytest.raises(ValueError):
        await uc.execute("test@example.com", "pw123")


# ---------------------------------------------------------
# REGISTER USE CASE
# ---------------------------------------------------------
@pytest.mark.asyncio
async def test_register_success():
    user_repo = AsyncMock()
    token_repo = AsyncMock()
    domain = AsyncMock()

    user_repo.get_by_email.return_value = None  # email free

    # simulate DB saving user
    user_repo.create.return_value = mock_user()

    uc = RegisterUserUseCase(user_repo, token_repo, domain)

    result = await uc.execute("new@example.com", "pw123")

    assert "access_token" in result
    assert "refresh_token" in result
    assert result["user"].email == "test@example.com"

    # domain.validate_new_user should be called
    domain.validate_new_user.assert_called_once()

    # token_repo.create should be called with hashed token
    args, kwargs = token_repo.create.call_args
    saved_token: RefreshToken = args[0]

    assert saved_token.user_id == 1
    assert saved_token.token == hash_token(result["refresh_token"])


@pytest.mark.asyncio
async def test_register_email_exists():
    user_repo = AsyncMock()
    token_repo = AsyncMock()
    domain = AsyncMock()

    user_repo.get_by_email.return_value = mock_user()

    uc = RegisterUserUseCase(user_repo, token_repo, domain)

    with pytest.raises(ValueError):
        await uc.execute("test@example.com", "pw123")


# ---------------------------------------------------------
# LOGOUT USE CASE
# ---------------------------------------------------------
@pytest.mark.asyncio
async def test_logout_success():
    token_repo = AsyncMock()

    # simulate token found
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

    token_repo.revoke.assert_called_once_with(10)


@pytest.mark.asyncio
async def test_logout_no_token():
    token_repo = AsyncMock()

    token_repo.get_by_token.return_value = None

    uc = LogoutUseCase(token_repo)

    await uc.execute("rawtoken123")

    token_repo.revoke.assert_not_called()


@pytest.mark.asyncio
async def test_logout_no_cookie():
    token_repo = AsyncMock()

    uc = LogoutUseCase(token_repo)

    await uc.execute(None)

    token_repo.revoke.assert_not_called()

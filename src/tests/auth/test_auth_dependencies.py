"""
Regression tests for the auth_required dependency itself.

These cover the exact failure paths behind the "still logged in
without tokens" bug:

  * a request with no auth cookies must be 401 (not a crash,
    not a silently-returned user),
  * invalid access + refresh cookies must be 401,
  * a valid refresh cookie with no access cookie must refresh
    the session (new cookies issued, old refresh token rotated).
"""

from datetime import datetime

import pytest
from fastapi import Request, Response, HTTPException

from core.security.dependencies import auth_required

from auth.domain.entities.user import User
from auth.domain.entities.refresh_token import RefreshToken
from auth.infrastructure.repositories.user_repo_impl import UserRepository
from auth.infrastructure.repositories.token_repo_impl import TokenRepository
from auth.infrastructure.helpers.password_hash import hash_password
from auth.infrastructure.helpers.refresh_token_generator import (
    generate_refresh_token,
)
from auth.infrastructure.helpers.token_hash import hash_token


def make_request(cookies: dict) -> Request:
    cookie_header = "; ".join(
        f"{key}={value}" for key, value in cookies.items()
    )

    scope = {
        "type": "http",
        "http_version": "1.1",
        "method": "GET",
        "scheme": "http",
        "path": "/",
        "raw_path": b"/",
        "query_string": b"",
        "headers": (
            [(b"cookie", cookie_header.encode())]
            if cookie_header
            else []
        ),
        "client": ("127.0.0.1", 1234),
        "server": ("testserver", 80),
    }

    return Request(scope)


@pytest.mark.asyncio
async def test_no_auth_cookies_is_unauthenticated():
    request = make_request({})

    with pytest.raises(HTTPException) as exc_info:
        await auth_required(request, Response(), session=None)

    assert exc_info.value.status_code == 401


@pytest.mark.asyncio
async def test_invalid_access_and_refresh_cookies_are_unauthenticated(
    db_session,
):
    request = make_request(
        {
            "access_token": "not-a-valid-jwt",
            "refresh_token": "not-a-known-refresh-token",
        }
    )

    with pytest.raises(HTTPException) as exc_info:
        await auth_required(request, Response(), session=db_session)

    assert exc_info.value.status_code == 401


@pytest.mark.asyncio
async def test_valid_refresh_cookie_refreshes_the_session(db_session):
    user_repo = UserRepository(db_session)
    token_repo = TokenRepository(db_session)

    user = await user_repo.create(
        User(
            id=None,
            email="refresh@example.com",
            hashed_password=hash_password("pw123123123"),
            is_admin=False,
            is_active=True,
            created_at=datetime.utcnow(),
        )
    )

    raw_refresh = generate_refresh_token(user.id)

    # Tokens are stored hashed (same as the register use case).
    await token_repo.create(
        RefreshToken(
            id=None,
            user_id=user.id,
            token=hash_token(raw_refresh.token),
            expires_at=raw_refresh.expires_at,
            created_at=raw_refresh.created_at,
            revoked=False,
        )
    )

    request = make_request({"refresh_token": raw_refresh.token})
    response = Response()

    result = await auth_required(request, response, session=db_session)

    # The user is resolved even though no access token was sent.
    assert result is not None
    assert result.id == user.id

    # New access + refresh cookies are issued on the response.
    set_cookie_headers = [
        value.decode()
        for key, value in response.raw_headers
        if key == b"set-cookie"
    ]

    assert any(
        header.startswith("access_token=")
        for header in set_cookie_headers
    )
    assert any(
        header.startswith("refresh_token=")
        for header in set_cookie_headers
    )

    # The presented refresh token was rotated: it can no longer
    # be replayed.
    assert (
        await token_repo.get_by_token(raw_refresh.token)
    ) is None

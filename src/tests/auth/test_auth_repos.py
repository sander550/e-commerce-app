import pytest
from auth.infrastructure.repositories.user_repo_impl import UserRepository
from auth.infrastructure.repositories.token_repo_impl import TokenRepository

from auth.domain.entities.user import User
from auth.domain.entities.refresh_token import RefreshToken

from auth.infrastructure.helpers.token_hash import hash_token
from auth.infrastructure.helpers.refresh_token_generator import generate_refresh_token


# ---------------------------------------------------------
# USER REPOSITORY TESTS
# ---------------------------------------------------------

@pytest.mark.asyncio
async def test_user_create_and_get(db_session):
    repo = UserRepository(db_session)

    user = User(
        id=None,
        email="test@example.com",
        hashed_password="hashed_pw",
        is_admin=False,
        is_active=True,
        created_at=None,
    )

    created = await repo.create(user)

    assert created.id is not None
    assert created.email == "test@example.com"

    fetched = await repo.get_by_id(created.id)
    assert fetched.email == "test@example.com"


@pytest.mark.asyncio
async def test_user_get_by_email(db_session):
    repo = UserRepository(db_session)

    user = User(
        id=None,
        email="findme@example.com",
        hashed_password="pw",
        is_admin=False,
        is_active=True,
        created_at=None,
    )

    await repo.create(user)

    fetched = await repo.get_by_email("findme@example.com")
    assert fetched is not None
    assert fetched.email == "findme@example.com"


@pytest.mark.asyncio
async def test_user_update(db_session):
    repo = UserRepository(db_session)

    user = User(
        id=None,
        email="old@example.com",
        hashed_password="old_pw",
        is_admin=False,
        is_active=True,
        created_at=None,
    )

    created = await repo.create(user)

    created.email = "new@example.com"
    created.hashed_password = "new_pw"

    updated = await repo.update(created)

    assert updated.email == "new@example.com"
    assert updated.hashed_password == "new_pw"


# ---------------------------------------------------------
# TOKEN REPOSITORY TESTS
# ---------------------------------------------------------

@pytest.mark.asyncio
async def test_token_create_and_get(db_session):
    repo = TokenRepository(db_session)

    # 1. Generate raw token
    token_entity = generate_refresh_token(user_id=1)
    raw = token_entity.token

    # 2. Hash before storing (your app does this)
    hashed = hash_token(raw)
    token_entity.token = hashed

    # 3. Store hashed token
    created = await repo.create(token_entity)

    # 4. Fetch using raw token
    fetched = await repo.get_by_token(raw)

    assert fetched is not None
    assert fetched.user_id == 1


@pytest.mark.asyncio
async def test_token_delete(db_session):
    repo = TokenRepository(db_session)

    token_entity = generate_refresh_token(user_id=1)
    raw = token_entity.token
    token_entity.token = hash_token(raw)

    created = await repo.create(token_entity)

    await repo.delete(created.id)

    fetched = await repo.get_by_token(raw)
    assert fetched is None


@pytest.mark.asyncio
async def test_token_delete_all_for_user(db_session):
    repo = TokenRepository(db_session)

    t1_raw = generate_refresh_token(user_id=5)
    t1_raw.token = hash_token(t1_raw.token)
    t1 = await repo.create(t1_raw)

    t2_raw = generate_refresh_token(user_id=5)
    t2_raw.token = hash_token(t2_raw.token)
    t2 = await repo.create(t2_raw)

    await repo.delete_all_for_user(5)

    assert await repo.get_by_token(t1_raw.token) is None
    assert await repo.get_by_token(t2_raw.token) is None


@pytest.mark.asyncio
async def test_token_revoke(db_session):
    repo = TokenRepository(db_session)

    token_entity = generate_refresh_token(user_id=1)
    raw = token_entity.token
    token_entity.token = hash_token(raw)

    created = await repo.create(token_entity)

    await repo.revoke(created.id)

    fetched = await repo.get_by_token(raw)
    assert fetched is None


@pytest.mark.asyncio
async def test_token_rotate(db_session):
    repo = TokenRepository(db_session)

    old_raw = generate_refresh_token(user_id=10)
    old_raw.token = hash_token(old_raw.token)
    old_token = await repo.create(old_raw)

    new_raw, new_entity = await repo.rotate_refresh_token(old_token)

    assert new_raw is not None
    assert new_entity.user_id == 10

    # old token should be revoked
    assert await repo.get_by_token(old_raw.token) is None

    # new token should be valid
    new_fetched = await repo.get_by_token(new_raw)
    assert new_fetched is not None
    assert new_fetched.user_id == 10

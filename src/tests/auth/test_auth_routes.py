import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock

from main import app

from auth.domain.entities.user import User
from auth.application.use_cases.register_user import RegisterUserUseCase
from auth.application.use_cases.login_user import LoginUserUseCase
from auth.application.use_cases.logout_user import LogoutUseCase

from core.security.dependencies import auth_required, auth_optional
from core.application.use_case_factories.auth_factories import (
    get_register_use_case,
    get_login_use_case,
    get_logout_use_case,
)
client = TestClient(app)



def mock_user():
    return User(
        id=1,
        email="test@example.com",
        hashed_password="argon2$mocked_hash",
        is_admin=False,
        is_active=True,
        created_at=None,
    )


# ---------------- REGISTER ----------------

@pytest.fixture
def mock_register_uc():
    mock = AsyncMock()
    mock.execute.return_value = {
        "user": mock_user(),
        "access_token": "ACCESS123",
        "refresh_token": "REFRESH123",
    }
    return mock


def test_register_success(mock_register_uc):
    app.dependency_overrides[auth_optional] = lambda: None
    app.dependency_overrides[get_register_use_case] = lambda: mock_register_uc

    response = client.post(
        "/auth/register",
        json={"email": "test@example.com", "password": "pw123"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "User registered"
    assert data["user"]["email"] == "test@example.com"
    assert response.cookies.get("access_token") == "ACCESS123"
    assert response.cookies.get("refresh_token") == "REFRESH123"

    app.dependency_overrides = {}


def test_register_already_logged_in():
    app.dependency_overrides[auth_optional] = lambda: mock_user()
    app.dependency_overrides[get_register_use_case] = lambda: AsyncMock()

    response = client.post(
        "/auth/register",
        json={"email": "test@example.com", "password": "pw123"},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Already logged in"

    app.dependency_overrides = {}


# ---------------- LOGIN ----------------

@pytest.fixture
def mock_login_uc():
    mock = AsyncMock()
    mock.execute.return_value = {
        "user": mock_user(),
        "access_token": "ACCESS_LOGIN",
        "refresh_token": "REFRESH_LOGIN",
    }
    return mock


def test_login_success(mock_login_uc):
    app.dependency_overrides[auth_optional] = lambda: None
    app.dependency_overrides[get_login_use_case] = lambda: mock_login_uc

    response = client.post(
        "/auth/login",
        json={"email": "test@example.com", "password": "pw123"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Login successful"
    assert data["user"]["email"] == "test@example.com"
    assert response.cookies.get("access_token") == "ACCESS_LOGIN"
    assert response.cookies.get("refresh_token") == "REFRESH_LOGIN"

    app.dependency_overrides = {}


def test_login_already_logged_in():
    app.dependency_overrides[auth_optional] = lambda: mock_user()
    app.dependency_overrides[get_login_use_case] = lambda: AsyncMock()

    response = client.post(
        "/auth/login",
        json={"email": "test@example.com", "password": "pw123"},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Already logged in"

    app.dependency_overrides = {}


# ---------------- LOGOUT ----------------

@pytest.fixture
def mock_logout_uc():
    mock = AsyncMock()
    mock.execute.return_value = None
    return mock


def test_logout_success(mock_logout_uc):
    app.dependency_overrides[get_logout_use_case] = lambda: mock_logout_uc

    client.cookies.set("refresh_token", "REFRESH123")
    client.cookies.set("access_token", "ACCESS123")

    response = client.post("/auth/logout")

    assert response.status_code == 200
    assert response.json()["success"] is True

    app.dependency_overrides = {}


# ---------------- PROFILE ----------------

def test_profile_success():
    app.dependency_overrides[auth_required] = lambda: mock_user()

    response = client.get("/auth/profile")

    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["id"] == 1

    app.dependency_overrides = {}


def test_profile_not_authenticated():
    app.dependency_overrides[auth_required] = lambda: None

    response = client.get("/auth/profile")

    assert response.status_code == 400
    assert response.json()["detail"] == "Not authenticated"

    app.dependency_overrides = {}

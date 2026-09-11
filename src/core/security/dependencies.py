from fastapi import Request, Response, Depends, HTTPException
from auth.domain.services.auth_domain_service import AuthDomainService
from auth.infrastructure.repositories.token_repo_impl import TokenRepository
from auth.infrastructure.repositories.user_repo_impl import UserRepository
from auth.infrastructure.helpers.jwt import create_access_token
from core.infrastructure.database import get_session
from auth.infrastructure.helpers.token_hash import hash_token


async def auth_required(
    request: Request,
    response: Response,
    session=Depends(get_session)
):
    service = AuthDomainService()
    token_repo = TokenRepository(session)
    user_repo = UserRepository(session)

    # ----------------------------
    # 1. Extract cookies
    # -----------------------------
    access_token = request.cookies.get("access_token")
    refresh_token = request.cookies.get("refresh_token")
    # -----------------------------
    # 2. Try ACCESS token
    # -----------------------------
    payload = await service.verify_access_token(access_token)

    if payload:
        user_id = payload["user_id"]
        user = await user_repo.get_by_id(user_id)
        request.state.user = user
        return user

    # -----------------------------
    # 3. Try REFRESH token
    # ----------------------------
    db_token = await token_repo.get_by_token(refresh_token)

    try:
        await service.validate_refresh_token(db_token)
    except ValueError as e:
        raise HTTPException(401, "Unauthorized")

    # If validation passed, rotate token
    new_raw, new_entity = await token_repo.rotate_refresh_token(db_token)

    new_access = create_access_token({"sub": str(db_token.user_id)})

    response.set_cookie(
        "refresh_token",
        new_raw,
        httponly=True,
        secure=True,  # REQUIRED for SameSite=None
        samesite="none",  # REQUIRED for cross-site cookies
        max_age=60 * 60 * 24 * 7
    )

    response.set_cookie(
        "access_token",
        new_access,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=60 * 15
    )

    user = await user_repo.get_by_id(db_token.user_id)
    request.state.user = user
    return user


async def auth_optional(
    request: Request,
    session=Depends(get_session)
):
    service = AuthDomainService()
    token_repo = TokenRepository(session)

    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        return None

    db_token = await token_repo.get_by_token(refresh_token)
    if not db_token:
        return None

    try:
        await service.validate_refresh_token(db_token)
    except Exception:
        return None

    return db_token.user_id


async def admin_required(user=Depends(auth_required)):
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admins only")
    return user

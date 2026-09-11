from fastapi import APIRouter, Depends, Request, Response, HTTPException
from fastapi.responses import JSONResponse

from auth.application.use_cases.register_user import RegisterUserUseCase
from auth.application.use_cases.login_user import LoginUserUseCase
from auth.application.use_cases.logout_user import LogoutUseCase
from core.security.dependencies import auth_required, auth_optional

from auth.application.dto.auth_dto import (
    UserReadDTO,
    UserRequestDTO
)
from auth.infrastructure.helpers.token_hash import hash_token
from core.application.use_case_factories.auth_factories import (
    get_register_use_case,
    get_login_use_case,
    get_logout_use_case
)
router = APIRouter(prefix="/auth", tags=["Auth"])

# ---------------------------------------------------------
# REGISTER
# ---------------------------------------------------------
@router.post("/register")
async def register(
    dto: UserRequestDTO,
    user = Depends(auth_optional),
    use_case: RegisterUserUseCase = Depends(get_register_use_case)
):
    if user:
        raise HTTPException(400, "Already logged in")

    try:
        result = await use_case.execute(dto.email, dto.password)
    except Exception as e:
        # Return proper error status
        raise HTTPException(status_code=400, detail=str(e))

    response = JSONResponse({
        "message": "User registered",
        "user": {
            "id": result["user"].id,
            "email": result["user"].email
        }
    })

    response.set_cookie(
        key="access_token",
        value=result["access_token"],
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=60 * 15
    )

    response.set_cookie(
        key="refresh_token",
        value=result["refresh_token"],
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=60 * 60 * 24 * 7
    )

    return response


# ---------------------------------------------------------
# LOGIN
# ---------------------------------------------------------
@router.post("/login")
async def login(
    dto: UserRequestDTO,
    user = Depends(auth_optional),
    use_case: LoginUserUseCase = Depends(get_login_use_case)
):
    if user:
        raise HTTPException(400, "Already logged in")

    try:
        result = await use_case.execute(dto.email, dto.password)
    except Exception as e:
        raise HTTPException(400, detail=str(e))

    response = JSONResponse({
        "message": "Login successful",
        "user": {
            "id": result["user"].id,
            "email": result["user"].email
        }
    })

    response.set_cookie(
        key="access_token",
        value=result["access_token"],
        httponly=True,
        secure=True,
        samesite="none",
        max_age=60 * 15
    )

    response.set_cookie(
        key="refresh_token",
        value=result["refresh_token"],
        httponly=True,
        secure=True,
        samesite="none",
        max_age=60 * 60 * 24 * 7
    )

    return response


# ---------------------------------------------------------
# LOGOUT
# ---------------------------------------------------------
@router.post("/logout")
async def logout(
    request: Request,
    response: Response,
    use_case: LogoutUseCase = Depends(get_logout_use_case)
):
    refresh_token = request.cookies.get("refresh_token")

    try:
        await use_case.execute(refresh_token)
    except Exception as e:
        raise HTTPException(400, detail=str(e))

    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")

    return {"success": True}


@router.get("/profile")
async def get_current_user(
    user=Depends(auth_required)
):
    if user is None:
        raise HTTPException(
            status_code=400,
            detail="Not authenticated"
        )

    return UserReadDTO(
        id=user.id,
        email=user.email,
        is_admin=user.is_admin,
        is_active=user.is_active,
        created_at=user.created_at
    )

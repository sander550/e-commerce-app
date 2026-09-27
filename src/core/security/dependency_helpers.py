from fastapi import Request
from jose import JWTError, jwt

from core.config.settings import settings


def get_user_id_from_request(request: Request) -> str | None:
    """
    Get the authenticated user's ID from the JWT access token.

    Returns None if the request is unauthenticated or the token
    cannot be decoded.
    """
    token = request.cookies.get("access_token")

    if not token:
        return None

    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
        )

        user_id = payload.get("sub")

        if user_id is None:
            return None

        return str(user_id)

    except JWTError:
        return None
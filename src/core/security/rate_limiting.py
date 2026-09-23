import time

from fastapi import Request
from fastapi.responses import JSONResponse
from jose import jwt, JWTError

from core.config import settings
from core.infrastructure.redis import redis_client
from core.security.dependencies_helpers import get_user_id_from_request

# ---------------------------------------------------------
# RATE LIMIT SETTINGS
# ---------------------------------------------------------

IP_LIMIT = 100
USER_LIMIT = 200
WINDOW_SECONDS = 60

# ---------------------------------------------------------
# RATE LIMIT CHECK
# ---------------------------------------------------------

async def check_rate_limit(
    key: str,
    limit: int,
) -> bool:
    """
    Returns True if the request is allowed.
    Returns False if the limit has been exceeded.
    """

    count = await redis_client.incr(key)

    # First request → start the expiration window
    if count == 1:
        await redis_client.expire(key, WINDOW_SECONDS)

    return count <= limit


# ---------------------------------------------------------
# RATE LIMIT MIDDLEWARE
# ---------------------------------------------------------

async def rate_limit_middleware(request: Request, call_next):

    # -----------------------------------------------------
    # IP LIMIT
    # -----------------------------------------------------

    client_ip = request.client.host

    ip_key = f"rate_limit:ip:{client_ip}"

    ip_allowed = await check_rate_limit(
        key=ip_key,
        limit=IP_LIMIT,
    )

    if not ip_allowed:
        return JSONResponse(
            status_code=429,
            content={
                "detail": "Too many requests from this IP address."
            },
        )

    # -----------------------------------------------------
    # USER LIMIT
    # -----------------------------------------------------

    user_id = get_user_id_from_request(request)

    if user_id:

        user_key = f"rate_limit:user:{user_id}"

        user_allowed = await check_rate_limit(
            key=user_key,
            limit=USER_LIMIT,
        )

        if not user_allowed:
            return JSONResponse(
                status_code=429,
                content={
                    "detail": "Too many requests from this user."
                },
            )

    # -----------------------------------------------------
    # CONTINUE REQUEST
    # -----------------------------------------------------

    response = await call_next(request)

    return response
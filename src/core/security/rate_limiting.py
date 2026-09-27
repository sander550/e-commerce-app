from fastapi import Request
from fastapi.responses import JSONResponse

from core.config import settings
from core.security.dependency_helpers import get_user_id_from_request
from core.security.rate_limiting_service import RedisRateLimitService

class RateLimitMiddleware:

    def __init__(
        self,
        rate_limiter: RedisRateLimitService,
    ):
        self.rate_limiter = rate_limiter

    async def rate_limiting_middleware(
        self,
        request: Request,
        call_next,
    ):
        # -----------------------------------------------------
        # IP LIMIT
        # -----------------------------------------------------

        client_ip = request.client.host

        ip_allowed = await self.rate_limiter.check_ip_limit(
            client_ip,
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
            user_allowed = await self.rate_limiter.check_user_limit(
                user_id,
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
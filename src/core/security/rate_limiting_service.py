from redis.asyncio import Redis
from core.config.settings import settings


class RedisRateLimitService:
    def __init__(self, redis: Redis):
        self.redis = redis

    # -------------------------
    # Global IP limit
    # -------------------------

    async def check_ip_limit(
            self,
            ip: str,
    ) -> bool:

        key = f"rate_limit:ip:{ip}"

        requests = await self.redis.get(key)

        if requests is not None and int(requests) >= settings.GLOBAL_IP_LIMIT:
            return False

        requests = await self.redis.incr(key)

        if requests == 1:
            await self.redis.expire(
                key,
                settings.GLOBAL_WINDOW_SECONDS,
            )

        return True

    # -------------------------
    # Global user limit
    # -------------------------

    async def check_user_limit(
            self,
            user_id: str,
    ) -> bool:

        key = f"rate_limit:user:{user_id}"

        requests = await self.redis.get(key)

        if requests is not None and int(requests) >= settings.GLOBAL_USER_LIMIT:
            return False

        requests = await self.redis.incr(key)

        if requests == 1:
            await self.redis.expire(
                key,
                settings.GLOBAL_WINDOW_SECONDS,
            )

        return True

    # -------------------------
    # Login IP limit
    # -------------------------

    async def check_login_ip_limit(
            self,
            ip: str,
    ) -> bool:

        key = f"rate_limit:login:ip:{ip}"

        attempts = await self.redis.get(key)

        if attempts is not None and int(attempts) >= settings.LOGIN_IP_LIMIT:
            return False

        attempts = await self.redis.incr(key)

        if attempts == 1:
            await self.redis.expire(
                key,
                settings.LOGIN_WINDOW_SECONDS,
            )

        return True

    # -------------------------
    # Login user limit
    # -------------------------

    async def check_login_user_limit(
            self,
            email: str,
    ) -> bool:

        key = f"rate_limit:login:user:{email.lower()}"

        attempts = await self.redis.get(key)

        if attempts is not None and int(attempts) >= settings.LOGIN_USER_LIMIT:
            return False

        attempts = await self.redis.incr(key)

        if attempts == 1:
            await self.redis.expire(
                key,
                settings.LOGIN_WINDOW_SECONDS,
            )

        return True

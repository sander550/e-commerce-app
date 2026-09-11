
from redis.asyncio import Redis
from core.config.settings import settings

redis_client = Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    decode_responses=True
)

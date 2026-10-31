from redis.asyncio import Redis
from core.config.settings import settings

redis_client = Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    decode_responses=True,
    # redis-py 8.x defaults socket_timeout to 5s, which races with the email
    # worker's BRPOP (timeout=5) and raises TimeoutError on an empty queue.
    socket_timeout=settings.REDIS_SOCKET_TIMEOUT
)

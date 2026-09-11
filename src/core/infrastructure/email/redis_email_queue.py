import json

class RedisEmailQueue:
    def __init__(self, redis_client):
        self.redis = redis_client

    async def enqueue(self, email: str, subject: str, body: str):
        payload = json.dumps({
            "email": email,
            "subject": subject,
            "body": body
        })
        print("redis queue hit")
        print(payload)

        await self.redis.lpush("email_queue", payload)

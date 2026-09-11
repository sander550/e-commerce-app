import asyncio
import json
from core.infrastructure.redis import redis_client
from core.infrastructure.email.smtp_sender import SmtpSender

async def main():
    print("EMAIL WORKER hit")
    sender = SmtpSender()

    while True:

        payload = await redis_client.rpop("email_queue")

        if payload:
            data = json.loads(payload)
            await sender.send(
                data["email"],
                data["subject"],
                data["body"]
            )

        await asyncio.sleep(0.5)

asyncio.run(main())

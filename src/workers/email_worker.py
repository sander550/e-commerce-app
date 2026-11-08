"""Consumes payment-completion emails from Redis and sends them over SMTP.

Runs as its own compose service (`worker`). It is fire-and-forget: a
failure here never affects the API request that queued the email.
"""

import asyncio
import json

from core.infrastructure.redis import redis_client
from core.infrastructure.email.smtp_sender import SmtpSender

QUEUE = "email_queue"
MAX_ATTEMPTS = 3


async def main():
    sender = SmtpSender()

    while True:
        data = {}

        try:
            # Blocks up to 5s instead of busy-polling every 2s.
            item = await redis_client.brpop(QUEUE, timeout=5)
            if not item:
                continue

            _key, raw = item
            data = json.loads(raw)

            await sender.send(
                data["email"],
                data["subject"],
                data["body"],
            )

        except asyncio.CancelledError:
            raise
        except Exception:
            # Put the job back (up to MAX_ATTEMPTS) so a temporary SMTP
            # problem does not silently drop the confirmation email.
            try:
                attempts = int(data.get("_attempts", 0)) + 1

                if attempts < MAX_ATTEMPTS:
                    data["_attempts"] = attempts
                    await redis_client.lpush(QUEUE, json.dumps(data))
            except Exception:
                pass

            await asyncio.sleep(2)


asyncio.run(main())

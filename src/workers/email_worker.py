"""Consumes payment-completion emails from Redis and sends them over SMTP.

Runs as its own compose service (`worker`). It is fire-and-forget: a
failure here never affects the API request that queued the email.
"""

import asyncio
import json
import logging

from core.infrastructure.redis import redis_client
from core.infrastructure.email.smtp_sender import SmtpSender

QUEUE = "email_queue"
MAX_ATTEMPTS = 3

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [email_worker] %(levelname)s: %(message)s",
)
logger = logging.getLogger("email_worker")


async def main():
    sender = SmtpSender()
    logger.info("Email worker started, waiting for jobs on '%s'", QUEUE)

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

            logger.info("Sent '%s' to %s", data["subject"], data["email"])

        except asyncio.CancelledError:
            raise
        except Exception:
            logger.exception("Failed to process email job")

            # Put the job back (up to MAX_ATTEMPTS) so a temporary SMTP
            # problem does not silently drop the confirmation email.
            try:
                attempts = int(data.get("_attempts", 0)) + 1

                if attempts < MAX_ATTEMPTS:
                    data["_attempts"] = attempts
                    await redis_client.lpush(QUEUE, json.dumps(data))
                    logger.info("Requeued job (attempt %s/%s)", attempts, MAX_ATTEMPTS)
                else:
                    logger.error("Giving up on job after %s attempts", MAX_ATTEMPTS)
            except Exception:
                logger.exception("Could not requeue failed email job")

            await asyncio.sleep(2)


asyncio.run(main())

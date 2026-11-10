import asyncio
import json

from core.infrastructure.redis import redis_client
from core.infrastructure.email.smtp_sender import SmtpSender
from core.infrastructure.database import async_session_factory

from core.config.settings import settings
from order.infrastructure.repositories.order_repo_impl import OrderRepository
from catalog.infrastructure.repositories.product_repo_impl import ProductRepository
from catalog.infrastructure.repositories.category_repo_impl import CategoryRepository


async def main():
    # Run both the email worker and reservation checker concurrently
    await asyncio.gather(
        email_worker_loop(),
        reservation_checker()
    )


async def email_worker_loop():
    sender = SmtpSender()

    while True:
        data = {}

        try:
            # Blocks up to 5s instead of busy-polling every 2s.
            item = await redis_client.brpop(settings.QUEUE, timeout=5)
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
            try:
                attempts = int(data.get("_attempts", 0)) + 1

                if attempts < settings.MAX_ATTEMPTS:
                    data["_attempts"] = attempts
                    await redis_client.lpush(settings.QUEUE, json.dumps(data))
            except Exception:
                pass

            await asyncio.sleep(2)


async def check_expired_reservations():
    # Create a new session for this check
    async with async_session_factory() as session:
        try:
            order_repo = OrderRepository(session)
            category_repo = CategoryRepository(session)
            product_repo = ProductRepository(session, category_repo)

            orders = await order_repo.get_expired_pending_orders()

            for order in orders:
                for item in order.items:
                    if item.product_id is not None:
                        product = await product_repo.get_by_id(item.product_id)

                        if product:
                            product.stock += item.quantity
                            await product_repo.update(product)

                order.status = "expired"

            await session.commit()

        except Exception:
            await session.rollback()
            raise


async def reservation_checker():
    while True:
        try:
            await check_expired_reservations()

        except asyncio.CancelledError:
            raise
        except Exception:
            # Log error but continue running
            pass

        await asyncio.sleep(60)


asyncio.run(main())
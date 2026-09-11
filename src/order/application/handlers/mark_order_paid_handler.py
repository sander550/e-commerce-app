from core.application.providers.repo_provider import RepoProvider
from order.application.use_cases.mark_order_paid import MarkOrderPaidUseCase
from core.infrastructure.database import async_session_factory

async def mark_order_paid_handler(event):
    order_id = int(event.order_id)

    async with async_session_factory() as session:
        provider = RepoProvider(session)
        use_case = MarkOrderPaidUseCase(provider.order_repo)
        await use_case.execute(order_id)

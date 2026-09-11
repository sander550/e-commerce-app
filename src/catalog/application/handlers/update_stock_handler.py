from core.application.providers.repo_provider import RepoProvider
from catalog.application.use_cases.update_stock import UpdateStockUseCase
from core.infrastructure.database import async_session_factory

async def update_stock_handler(event):
    # Build use case manually because you cant use Depends in non routes
    order_id = int(event.order_id)

    async with async_session_factory() as session:
        provider = RepoProvider(session)
        use_case = UpdateStockUseCase(provider.order_repo, provider.product_repo)
        await use_case.execute(order_id)
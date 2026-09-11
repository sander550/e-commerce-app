from core.application.providers.repo_provider import RepoProvider
from cart.application.use_cases.clear_cart import ClearCartUseCase
from core.infrastructure.database import async_session_factory

async def clear_cart_handler(event):
    # Build use case manually because you cant use Depends in non routes
    user_id = int(event.user_id)

    async with async_session_factory() as session:
        provider = RepoProvider(session)
        use_case = ClearCartUseCase(provider.cart_repo)
        await use_case.execute(user_id)

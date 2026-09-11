from core.application.providers.repo_provider import RepoProvider
from notifications.application.use_cases.send_payment_completed_email import SendPaymentCompletedEmailUseCase
from core.infrastructure.database import async_session_factory

async def send_payment_completed_handler(event):
    # Build use case manually because you cant use Depends in non routes
    user_id = int(event.user_id)
    payment_id = int(event.payment_id)
    order_id = int(event.order_id)
    amount = float(event.amount)

    async with async_session_factory() as session:
        provider = RepoProvider(session)
        use_case = SendPaymentCompletedEmailUseCase(
            provider.user_repo,
            provider.order_repo,
            provider.payment_repo,
            provider.email_queue)
        await use_case.execute(user_id, payment_id, order_id, amount)

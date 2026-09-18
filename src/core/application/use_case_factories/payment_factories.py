from fastapi import Depends
from core.application.providers.repo_provider import RepoProvider, get_provider
from payment.application.use_cases.complete_payment import CompletePaymentUseCase
from payment.application.use_cases.capture_paypal_payment import CapturePayPalPaymentUseCase
from payment.application.use_cases.create_paypal_payment import CreatePayPalPaymentUseCase
from payment.application.use_cases.update_payment_status import UpdatePaymentStatusUseCase
from payment.domain.services.paypal_services import paypal_service


def get_complete_payment_use_case(
    provider: RepoProvider = Depends(get_provider)):
    return CompletePaymentUseCase(
    payment_repo=provider.payment_repo,
    cart_repo=provider.cart_repo
    )


def get_create_paypal_payment_use_case(
    provider: RepoProvider = Depends(get_provider)):
    return CreatePayPalPaymentUseCase(
        payment_repo=provider.payment_repo,
        order_repo=provider.order_repo)

def get_capture_paypal_payment_use_case(
    complete_payment_uc: CompletePaymentUseCase = Depends(get_complete_payment_use_case),
    provider: RepoProvider = Depends(get_provider)):
    return CapturePayPalPaymentUseCase(
        paypal_service=paypal_service,
        payment_repo=provider.payment_repo,
        complete_payment_uc=complete_payment_uc
    )

def get_update_payment_status_use_case(
    provider: RepoProvider = Depends(get_provider)):
    return UpdatePaymentStatusUseCase(
        payment_repo=provider.payment_repo,
    )
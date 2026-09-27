from auth.application.use_cases.logout_user import LogoutUseCase
from fastapi import Depends
from core.application.providers.repo_provider import RepoProvider, get_provider

from auth.application.use_cases.register_user import RegisterUserUseCase
from auth.application.use_cases.login_user import LoginUserUseCase

from auth.domain.services.auth_domain_service import AuthDomainService
from core.infrastructure.redis import redis_client
from core.security.rate_limiting_service import RedisRateLimitService


def get_register_use_case(
    provider: RepoProvider = Depends(get_provider)
) -> RegisterUserUseCase:
    return RegisterUserUseCase(
        user_repo=provider.user_repo,
        token_repo=provider.token_repo,
        domain=AuthDomainService()
    )


def get_login_use_case(
    provider: RepoProvider = Depends(get_provider)
) -> LoginUserUseCase:

    return LoginUserUseCase(
        user_repo=provider.user_repo,
        token_repo=provider.token_repo,
        domain=AuthDomainService(),
        rate_limiter=RedisRateLimitService(redis_client)
    )


def get_logout_use_case(
    provider: RepoProvider = Depends(get_provider)
) -> LoginUserUseCase:
    return LogoutUseCase(
        token_repo=provider.token_repo
    )


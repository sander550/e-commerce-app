class LogoutUseCase:
    def __init__(self, token_repo):
        self.token_repo = token_repo

    async def execute(self, raw_refresh_token: str):
        if not raw_refresh_token:
            return  # nothing to revoke

        db_token = await self.token_repo.get_by_token(raw_refresh_token)

        if not db_token:
            return  # token not found or already revoked

        # Revoke ONLY this session's token
        await self.token_repo.revoke(db_token.id)

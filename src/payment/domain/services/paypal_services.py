import httpx
from core.config.settings import settings

class PayPalService:
    def __init__(self):
        self.base_url = (
            "https://api-m.sandbox.paypal.com"
            if settings.PAYPAL_MODE == "sandbox"
            else "https://api-m.paypal.com"
        )
        self.client_id = settings.PAYPAL_CLIENT_ID
        self.secret = settings.PAYPAL_SECRET

    async def get_access_token(self):
        async with httpx.AsyncClient() as client:
            res = await client.post(
                f"{self.base_url}/v1/oauth2/token",
                auth=(self.client_id, self.secret),
                data={"grant_type": "client_credentials"},
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            return res.json()["access_token"]

    async def create_order(self, amount: float):
        token = await self.get_access_token()

        async with httpx.AsyncClient() as client:
            res = await client.post(
                f"{self.base_url}/v2/checkout/orders",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json",
                    "Prefer": "return=representation",
                },
                json={
                    "intent": "CAPTURE",
                    "purchase_units": [
                        {
                            "amount": {
                                "currency_code": "EUR",
                                "value": str(amount)
                            }
                        }
                    ],
                    "application_context": {
                        "return_url": settings.PAYPAL_RETURN_URL,  # MUST point to /capture
                        "cancel_url": settings.PAYPAL_CANCEL_URL,
                    },
                },
            )
            return res.json()

    async def capture_order(self, order_id: str):
        token = await self.get_access_token()

        async with httpx.AsyncClient() as client:
            res = await client.post(
                f"{self.base_url}/v2/checkout/orders/{order_id}/capture",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json",
                    "Prefer": "return=representation",
                },
            )
            return res.json()


paypal_service = PayPalService()

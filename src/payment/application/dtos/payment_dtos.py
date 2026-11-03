from pydantic import BaseModel


class CreatePayPalPaymentRequestDTO(BaseModel):
    order_id: int

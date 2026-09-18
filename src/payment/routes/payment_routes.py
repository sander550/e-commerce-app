from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse

from core.security.dependencies import auth_required
from payment.application.use_cases.create_paypal_payment import CreatePayPalPaymentUseCase
from payment.application.use_cases.capture_paypal_payment import CapturePayPalPaymentUseCase
from payment.application.dtos.payment_dtos import CreatePayPalPaymentRequestDTO
from payment.application.use_cases.update_payment_status import UpdatePaymentStatusUseCase
from payment.domain.entities.payment import PaymentStatus
from core.application.use_case_factories.payment_factories import (get_create_paypal_payment_use_case,
                                                                   get_capture_paypal_payment_use_case,
                                                                   get_update_payment_status_use_case
                                                                   )

router = APIRouter(prefix="/payment")

#----------------------------------------- PAYPAL ------------------------------------------
@router.post("/create")
async def create_paypal_payment(
    dto: CreatePayPalPaymentRequestDTO,
    user=Depends(auth_required),
    use_case: CreatePayPalPaymentUseCase = Depends(get_create_paypal_payment_use_case)
):
    if user.id != user.id:
        raise HTTPException(403, "Unauthorized")
    try:
        result = await use_case.execute(dto.order_id, user.id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return JSONResponse(result)


@router.get("/success")
async def capture_paypal_payment(
    token: str,
    use_case: CapturePayPalPaymentUseCase = Depends(get_capture_paypal_payment_use_case),
    user=Depends(auth_required)
):
    try:
        result = await use_case.execute(token, user.id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return JSONResponse(result.to_dict())


@router.post("/payment/cancel")
async def cancel_payment(
    payment_id: int,
    user=Depends(auth_required),
    use_case: UpdatePaymentStatusUseCase = Depends(get_update_payment_status_use_case)
):
    try:
        await use_case.execute(payment_id, user.id, PaymentStatus.FAILED)
        return {"status": "failed"}
    except PermissionError:
        raise HTTPException(status_code=403, detail="Not your payment")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))




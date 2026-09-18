from unittest.mock import AsyncMock, MagicMock

import pytest

from payment.infrastructure.db.payment_repository import PaymentRepository


# ---------------------------------------------------------
# _to_domain
# ---------------------------------------------------------

def test_to_domain():
    session = AsyncMock()
    repo = PaymentRepository(session)

    model = MagicMock()
    model.id = 1
    model.order_id = 10
    model.user_id = 5
    model.paypal_order_id = "PAYPAL123"
    model.amount = 49.99
    model.method = "paypal"
    model.status = "completed"
    model.created_at = None

    result = repo._to_domain(model)

    assert result.id == 1
    assert result.order_id == 10
    assert result.user_id == 5
    assert result.paypal_order_id == "PAYPAL123"
    assert result.amount == 49.99
    assert result.method == "paypal"
    assert result.status == "completed"
    assert result.created_at is None


# ---------------------------------------------------------
# create
# ---------------------------------------------------------

@pytest.mark.asyncio
async def test_create():
    session = AsyncMock()
    repo = PaymentRepository(session)

    payment = MagicMock()
    payment.order_id = 10
    payment.user_id = 5
    payment.paypal_order_id = "PAYPAL123"
    payment.amount = 49.99
    payment.method = "paypal"
    payment.status = "completed"

    model = MagicMock()
    model.id = 1
    model.order_id = 10
    model.user_id = 5
    model.paypal_order_id = "PAYPAL123"
    model.amount = 49.99
    model.method = "paypal"
    model.status = "completed"
    model.created_at = None

    session.add = MagicMock()
    session.refresh = AsyncMock()

    repo._to_domain = MagicMock(return_value=payment)

    result = await repo.create(payment)

    session.add.assert_called_once()
    session.commit.assert_awaited_once()
    session.refresh.assert_awaited_once()

    assert result == payment


# ---------------------------------------------------------
# get_by_id
# ---------------------------------------------------------

@pytest.mark.asyncio
async def test_get_by_id():
    session = AsyncMock()
    repo = PaymentRepository(session)

    model = MagicMock()
    model.id = 1
    model.order_id = 10
    model.user_id = 5
    model.paypal_order_id = "PAYPAL123"
    model.amount = 49.99
    model.method = "paypal"
    model.status = "completed"
    model.created_at = None

    session.execute.return_value.scalar_one_or_none.return_value = model

    result = await repo.get_by_id(1)

    assert result.id == 1
    assert result.order_id == 10
    assert result.user_id == 5
    assert result.paypal_order_id == "PAYPAL123"


# ---------------------------------------------------------
# get_by_order_id
# ---------------------------------------------------------

@pytest.mark.asyncio
async def test_get_by_order_id():
    session = AsyncMock()
    repo = PaymentRepository(session)

    model = MagicMock()
    model.id = 1
    model.order_id = 10
    model.user_id = 5
    model.paypal_order_id = "PAYPAL123"
    model.amount = 49.99
    model.method = "paypal"
    model.status = "completed"
    model.created_at = None

    session.execute.return_value.scalar_one_or_none.return_value = model

    result = await repo.get_by_order_id(10)

    assert result.id == 1
    assert result.order_id == 10
    assert result.user_id == 5


# ---------------------------------------------------------
# update
# ---------------------------------------------------------

@pytest.mark.asyncio
async def test_update():
    session = AsyncMock()
    repo = PaymentRepository(session)

    payment = MagicMock()
    payment.id = 1
    payment.status = "completed"
    payment.method = "paypal"
    payment.amount = 59.99

    model = MagicMock()
    model.id = 1

    session.execute.return_value.scalar_one_or_none.return_value = model

    repo._to_domain = MagicMock(return_value=payment)

    result = await repo.update(payment)

    assert model.status == "completed"
    assert model.method == "paypal"
    assert model.amount == 59.99

    session.commit.assert_awaited_once()
    session.refresh.assert_awaited_once_with(model)

    assert result == payment


# ---------------------------------------------------------
# get_by_paypal_order_id
# ---------------------------------------------------------

@pytest.mark.asyncio
async def test_get_by_paypal_order_id():
    session = AsyncMock()
    repo = PaymentRepository(session)

    model = MagicMock()
    model.id = 1
    model.order_id = 10
    model.user_id = 5
    model.paypal_order_id = "PAYPAL123"
    model.amount = 49.99
    model.method = "paypal"
    model.status = "completed"
    model.created_at = None

    session.execute.return_value.scalar_one_or_none.return_value = model

    result = await repo.get_by_paypal_order_id("PAYPAL123")

    assert result.id == 1
    assert result.paypal_order_id == "PAYPAL123"
    assert result.order_id == 10
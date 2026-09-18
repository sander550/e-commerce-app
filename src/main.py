from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# All routers combined in one place
from api.router import router
from core.infrastructure.database import Base, engine

# Event bus + events
from core.events.event_bus import event_bus
from order.application.handlers.mark_order_paid_handler import mark_order_paid_handler
from cart.application.handlers.clear_cart_handler import clear_cart_handler
from catalog.application.handlers.update_stock_handler import update_stock_handler
from notifications.application.handlers.send_payment_completed_email_handler import send_payment_completed_handler


app = FastAPI(
    title="E‑Commerce API",
    version="1.0.0"
)

# ---------------------------------------------------------
# CORS (Next.js frontend)
# ---------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# Include all routers
# ---------------------------------------------------------
app.include_router(router)


# ---------------------------------------------------------
# STARTUP: SUBSCRIBE TO EVENTS
# ---------------------------------------------------------
@app.on_event("startup")
async def startup_event():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        print('tables created')

    event_bus.subscribe("payment.completed", mark_order_paid_handler)
    event_bus.subscribe("payment.completed", clear_cart_handler)
    event_bus.subscribe("payment.completed", update_stock_handler)
    event_bus.subscribe("payment.completed", send_payment_completed_handler)
    print("[EventBus] Subscribed to payment_completed")


# ---------------------------------------------------------
# Root endpoint
# ---------------------------------------------------------
# Serve static files
#app.mount("/static", StaticFiles(directory="../frontend/dist/assets"), name="static")

#@app.get("/")
#async def serve_frontend():
#    return FileResponse("../frontend/dist/index.html")
#".list_categorys



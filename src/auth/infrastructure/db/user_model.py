# user_model.py
from sqlalchemy import String, Boolean, DateTime, Integer
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from core.infrastructure.database import Base


class UserModel(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String)

    is_admin: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        server_default="false"
    )

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # ⭐ User’s saved default shipping address
    shipping_address: Mapped[str | None] = mapped_column(String(500), nullable=True)


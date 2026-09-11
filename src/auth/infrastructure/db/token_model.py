# token_model.py
from sqlalchemy import String, DateTime, Integer, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from core.infrastructure.database import Base


class RefreshTokenModel(Base):
    __tablename__ = "refresh_tokens"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    token: Mapped[str] = mapped_column(String, unique=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime)
    revoked: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

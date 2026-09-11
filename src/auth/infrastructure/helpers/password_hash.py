from passlib.context import CryptContext
from core.config.settings import settings

pwd_context = CryptContext(
    schemes=[settings.PASSWORD_HASH_SCHEME],
    deprecated="auto"
)

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

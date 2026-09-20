async def validate_password_strength(password: str) -> bool:
    if len(password) < 8:
        raise ValueError("Password must be at least 8 characters long.")

    if len(password) > 20:
        raise ValueError("Password must be shorter then 20 characters.")

    if not password.isalnum():
        raise ValueError("Password must only contain letters and numbers (no special characters or spaces).")

    if password.isalpha():
        raise ValueError("Password must contain at least one number.")

    if password.isdigit():
        raise ValueError("Password must contain at least one letter.")

    return True

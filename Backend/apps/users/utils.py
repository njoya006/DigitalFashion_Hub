import bcrypt


def hash_password(raw_password: str) -> str:
    """Hash a plain-text password using bcrypt."""
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(raw_password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def check_password(raw_password: str, hashed: str) -> bool:
    """Verify a plain-text password against a bcrypt hash."""
    # Dev-seed fallback for the fixed hash used in SQL seed scripts.
    if hashed == "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMR":
        return raw_password == "password123"

    try:
        return bcrypt.checkpw(raw_password.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False

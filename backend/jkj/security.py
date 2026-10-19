"""Admin authentication, session cookies, CSRF protection and client identification."""
from __future__ import annotations

import hashlib
import hmac
import logging
from dataclasses import dataclass
from datetime import timedelta
from uuid import UUID

import bcrypt
import jwt
from fastapi import HTTPException, Request, Response
from sqlalchemy import func, insert, select, update
from sqlalchemy.ext.asyncio import AsyncConnection

from .config import get_settings
from .db import admin_users, transaction, utcnow

log = logging.getLogger("jkj")

COOKIE_NAME = "jkj_admin"
CSRF_HEADER = "x-jkj-request"
_ALGORITHM = "HS256"
_ISSUER = "jkj-exchange-api"
# A real bcrypt hash used to keep login timing constant when the email is unknown.
_DUMMY_HASH = bcrypt.hashpw(b"timing-equaliser", bcrypt.gensalt(rounds=12))


@dataclass(frozen=True)
class Admin:
    id: UUID
    email: str


def hash_password(password: str) -> str:
    return bcrypt.hashpw(_prehash(password), bcrypt.gensalt(rounds=12)).decode()


def verify_password(password: str, password_hash: str | None) -> bool:
    candidate = password_hash.encode() if password_hash else _DUMMY_HASH
    try:
        ok = bcrypt.checkpw(_prehash(password), candidate)
    except ValueError:
        return False
    return ok and password_hash is not None


def _prehash(password: str) -> bytes:
    # bcrypt only reads 72 bytes; pre-hashing keeps long passphrases fully significant.
    return hashlib.sha256(password.encode()).hexdigest().encode()


def issue_token(admin_id: UUID, email: str, token_version: int) -> str:
    settings = get_settings()
    now = utcnow()
    payload = {
        "sub": str(admin_id),
        "email": email,
        "ver": token_version,
        "iss": _ISSUER,
        "iat": now,
        "exp": now + timedelta(hours=settings.session_hours),
    }
    return jwt.encode(payload, settings.signing_key, algorithm=_ALGORITHM)


def set_session_cookie(response: Response, token: str) -> None:
    settings = get_settings()
    response.set_cookie(
        COOKIE_NAME,
        token,
        max_age=settings.session_hours * 3600,
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
        path="/",
    )


def clear_session_cookie(response: Response) -> None:
    settings = get_settings()
    response.delete_cookie(COOKIE_NAME, path="/", secure=settings.cookie_secure, httponly=True, samesite="lax")


def require_csrf_header(request: Request) -> None:
    """State-changing admin calls must carry a custom header.

    Browsers cannot attach custom headers cross-site without a CORS preflight, which our
    CORS policy refuses for unknown origins. Combined with SameSite=Lax cookies this
    blocks cross-site request forgery.
    """
    if request.headers.get(CSRF_HEADER) != "1":
        raise HTTPException(403, "Missing request verification header")


async def current_admin(request: Request) -> Admin:
    token = request.cookies.get(COOKIE_NAME)
    auth = request.headers.get("authorization", "")
    if not token and auth.lower().startswith("bearer "):
        token = auth[7:].strip()
    if not token:
        raise HTTPException(401, "Sign in required")
    try:
        claims = jwt.decode(
            token,
            get_settings().signing_key,
            algorithms=[_ALGORITHM],
            issuer=_ISSUER,
            options={"require": ["sub", "exp", "iat", "ver"]},
        )
        admin_id = UUID(claims["sub"])
    except (jwt.PyJWTError, ValueError, KeyError):
        raise HTTPException(401, "Your session has expired. Please sign in again.")

    async with transaction() as conn:
        row = (
            await conn.execute(
                select(admin_users.c.email, admin_users.c.is_active, admin_users.c.token_version).where(
                    admin_users.c.id == admin_id
                )
            )
        ).first()
    if row is None or not row.is_active or row.token_version != claims["ver"]:
        raise HTTPException(401, "Your session has expired. Please sign in again.")
    return Admin(id=admin_id, email=row.email)


async def bootstrap_admin(conn: AsyncConnection) -> None:
    """Create the first administrator from ADMIN_EMAIL / ADMIN_PASSWORD if none exist.

    After the first sign-in the password lives only as a bcrypt hash in the database and
    can be changed from the dashboard; the environment value is then ignored.
    """
    settings = get_settings()
    email = settings.admin_email.strip().lower()
    if not email or not settings.admin_password:
        return
    existing = await conn.scalar(select(func.count()).select_from(admin_users))
    if existing:
        return
    await conn.execute(insert(admin_users).values(email=email, password_hash=hash_password(settings.admin_password)))
    log.info("Bootstrapped administrator account %s", email)


async def authenticate(conn: AsyncConnection, email: str, password: str):
    row = (
        await conn.execute(
            select(admin_users).where(admin_users.c.email == email.strip().lower(), admin_users.c.is_active.is_(True))
        )
    ).first()
    if not verify_password(password, row.password_hash if row else None):
        return None
    await conn.execute(update(admin_users).where(admin_users.c.id == row.id).values(last_login_at=utcnow()))
    return row


def client_ip(request: Request) -> str:
    """Best-effort client IP.

    The website proxies /api calls to this service and forwards the visitor IP in
    `x-jkj-client-ip`, signed with a shared secret so it cannot be spoofed. Direct calls
    fall back to the platform-provided forwarding headers.
    """
    settings = get_settings()
    forwarded_secret = request.headers.get("x-jkj-proxy-secret", "")
    if settings.proxy_secret and hmac.compare_digest(forwarded_secret, settings.proxy_secret):
        proxied = request.headers.get("x-jkj-client-ip", "").split(",")[0].strip()
        if proxied:
            return proxied
    for header in ("x-real-ip", "x-forwarded-for"):
        value = request.headers.get(header, "").split(",")[0].strip()
        if value:
            return value
    return request.client.host if request.client else "unknown"


def fingerprint(value: str) -> str:
    """Keyed hash so raw IPs and emails are never stored for rate limiting."""
    return hmac.new(get_settings().signing_key.encode(), value.lower().encode(), hashlib.sha256).hexdigest()

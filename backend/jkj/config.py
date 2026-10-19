"""Runtime settings, read from the environment (and `.env` locally).

Secrets live only in the server environment. Nothing here is ever sent to the browser.
"""
from __future__ import annotations

import logging
import secrets
from functools import lru_cache
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

log = logging.getLogger("jkj")


def _csv(value: str) -> list[str]:
    return [part.strip() for part in value.split(",") if part.strip()]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Database. Neon/Vercel inject DATABASE_URL (pooled) and DATABASE_URL_UNPOOLED.
    database_url: str = Field(default="sqlite+aiosqlite:///./jkj_dev.db", alias="DATABASE_URL")
    database_url_unpooled: str = Field(default="", alias="DATABASE_URL_UNPOOLED")

    # Admin authentication.
    jwt_secret: str = Field(default="", alias="JWT_SECRET")
    session_hours: int = Field(default=12, alias="ADMIN_SESSION_HOURS", ge=1, le=168)
    admin_email: str = Field(default="", alias="ADMIN_EMAIL")
    admin_password: str = Field(default="", alias="ADMIN_PASSWORD")

    # Web.
    frontend_url: str = Field(default="http://localhost:3000", alias="FRONTEND_URL")
    proxy_secret: str = Field(default="", alias="PROXY_SECRET")

    # Email (Resend).
    resend_api_key: str = Field(default="", alias="RESEND_API_KEY")
    notification_from_email: str = Field(
        default="JKJ Exchange Services <onboarding@resend.dev>", alias="NOTIFICATION_FROM_EMAIL"
    )
    notification_to_email: str = Field(default="jideofork@gmail.com", alias="NOTIFICATION_TO_EMAIL")
    reply_to_email: str = Field(default="jideofork@gmail.com", alias="REPLY_TO_EMAIL")
    send_customer_confirmation: bool = Field(default=True, alias="SEND_CUSTOMER_CONFIRMATION")

    # Anti-abuse.
    turnstile_secret_key: str = Field(default="", alias="TURNSTILE_SECRET_KEY")
    require_turnstile: bool = Field(default=False, alias="REQUIRE_TURNSTILE")
    inquiries_per_ip_per_hour: int = Field(default=6, alias="INQUIRIES_PER_IP_PER_HOUR", ge=1)
    inquiries_per_email_per_day: int = Field(default=5, alias="INQUIRIES_PER_EMAIL_PER_DAY", ge=1)
    login_attempts_per_15m: int = Field(default=8, alias="LOGIN_ATTEMPTS_PER_15M", ge=1)

    vercel_env: str = Field(default="", alias="VERCEL_ENV")

    @property
    def is_production(self) -> bool:
        return self.vercel_env == "production"

    @property
    def allowed_origins(self) -> list[str]:
        return [origin.rstrip("/") for origin in _csv(self.frontend_url)]

    @property
    def public_site_url(self) -> str:
        origins = self.allowed_origins
        return origins[0] if origins else "http://localhost:3000"

    @property
    def notification_recipients(self) -> list[str]:
        return _csv(self.notification_to_email)

    @property
    def cookie_secure(self) -> bool:
        return self.public_site_url.startswith("https://")

    @property
    def signing_key(self) -> str:
        if self.jwt_secret:
            return self.jwt_secret
        if self.is_production:
            raise RuntimeError("JWT_SECRET must be set in production")
        return _dev_secret()

    @property
    def sqlalchemy_url(self) -> tuple[str, dict]:
        """Return an async SQLAlchemy URL and driver connect args.

        Accepts the plain `postgres://...?sslmode=require` strings Neon and Supabase hand out.
        asyncpg rejects libpq-only query options, so they are translated into connect args.
        """
        raw = (self.database_url_unpooled or self.database_url).strip()
        if raw.startswith("sqlite"):
            if raw.startswith("sqlite://") and not raw.startswith("sqlite+aiosqlite"):
                raw = raw.replace("sqlite://", "sqlite+aiosqlite://", 1)
            return raw, {}

        parts = urlsplit(raw)
        scheme = "postgresql+asyncpg"
        query = dict(parse_qsl(parts.query))
        connect_args: dict = {"statement_cache_size": 0}
        sslmode = query.pop("sslmode", None)
        for libpq_only in ("channel_binding", "options", "pgbouncer", "connect_timeout"):
            query.pop(libpq_only, None)
        if sslmode and sslmode != "disable":
            connect_args["ssl"] = "require"
        url = urlunsplit((scheme, parts.netloc, parts.path, urlencode(query), parts.fragment))
        return url, connect_args


@lru_cache
def _dev_secret() -> str:
    log.warning("JWT_SECRET is not set; using an ephemeral development secret.")
    return secrets.token_urlsafe(48)


@lru_cache
def get_settings() -> Settings:
    return Settings()

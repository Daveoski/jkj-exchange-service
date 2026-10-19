"""Database schema and connection handling.

SQLAlchemy Core keeps the same code working on Postgres (Neon/Supabase in production)
and SQLite (local development and tests). Connections are not pooled in-process because
serverless functions are short-lived; Neon handles pooling on its side.
"""
from __future__ import annotations

import logging
import uuid
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    MetaData,
    Numeric,
    String,
    Table,
    Text,
    Uuid,
)
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncConnection, AsyncEngine, create_async_engine
from sqlalchemy.pool import NullPool

from .config import get_settings

log = logging.getLogger("jkj")

SERVICES = ("rmb", "usd", "alipay", "wechat", "bank", "other")
CURRENCIES = ("CNY", "USD", "NGN", "OTHER")
CONTACT_METHODS = ("WhatsApp", "Email", "Phone call")
STATUSES = ("new", "contacted", "in_progress", "completed", "closed")
EMAIL_STATES = ("pending", "sent", "partial", "failed", "disabled")


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _in(column: str, values: tuple[str, ...]) -> str:
    return f"{column} IN ({', '.join(repr(v) for v in values)})"


metadata = MetaData()

inquiries = Table(
    "inquiries",
    metadata,
    Column("id", Uuid, primary_key=True, default=uuid.uuid4),
    Column("reference", String(16), nullable=False, unique=True),
    Column("created_at", DateTime(timezone=True), nullable=False, default=utcnow),
    Column("updated_at", DateTime(timezone=True), nullable=False, default=utcnow),
    Column("full_name", String(120), nullable=False),
    Column("email", String(254), nullable=False),
    Column("phone", String(30), nullable=False),
    Column("company", String(160), nullable=False, default=""),
    Column("service", String(24), nullable=False),
    Column("currency", String(8), nullable=False),
    Column("amount", Numeric(18, 2), nullable=True),
    Column("contact_method", String(24), nullable=False),
    Column("message", Text, nullable=False),
    Column("status", String(24), nullable=False, default="new"),
    Column("admin_notes", Text, nullable=False, default=""),
    Column("email_status", String(16), nullable=False, default="pending"),
    Column("client_hash", String(64), nullable=False, default=""),
    CheckConstraint(_in("service", SERVICES), name="inquiries_service_check"),
    CheckConstraint(_in("currency", CURRENCIES), name="inquiries_currency_check"),
    CheckConstraint(_in("contact_method", CONTACT_METHODS), name="inquiries_contact_check"),
    CheckConstraint(_in("status", STATUSES), name="inquiries_status_check"),
    CheckConstraint("amount IS NULL OR amount > 0", name="inquiries_amount_check"),
)
Index("inquiries_created_idx", inquiries.c.created_at.desc())
Index("inquiries_status_idx", inquiries.c.status)
Index("inquiries_email_idx", inquiries.c.email)

inquiry_events = Table(
    "inquiry_events",
    metadata,
    Column("id", Uuid, primary_key=True, default=uuid.uuid4),
    Column("inquiry_id", Uuid, ForeignKey("inquiries.id", ondelete="CASCADE"), nullable=False),
    Column("created_at", DateTime(timezone=True), nullable=False, default=utcnow),
    Column("actor", String(254), nullable=False),
    Column("kind", String(24), nullable=False),
    Column("detail", Text, nullable=False, default=""),
)
Index("inquiry_events_inquiry_idx", inquiry_events.c.inquiry_id, inquiry_events.c.created_at)

admin_users = Table(
    "admin_users",
    metadata,
    Column("id", Uuid, primary_key=True, default=uuid.uuid4),
    Column("email", String(254), nullable=False, unique=True),
    Column("password_hash", String(255), nullable=False),
    Column("is_active", Boolean, nullable=False, default=True),
    Column("token_version", Integer, nullable=False, default=1),
    Column("created_at", DateTime(timezone=True), nullable=False, default=utcnow),
    Column("last_login_at", DateTime(timezone=True), nullable=True),
)

rate_events = Table(
    "rate_events",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("bucket", String(32), nullable=False),
    Column("key_hash", String(64), nullable=False),
    Column("created_at", DateTime(timezone=True), nullable=False, default=utcnow),
)
Index("rate_events_lookup_idx", rate_events.c.bucket, rate_events.c.key_hash, rate_events.c.created_at)


# JKJ's own published rates (a single row, id=1), edited from the dashboard.
rate_board = Table(
    "rate_board",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("is_published", Boolean, nullable=False, default=False),
    Column("cny_ngn", Numeric(18, 4), nullable=True),
    Column("usd_ngn", Numeric(18, 4), nullable=True),
    Column("note", String(240), nullable=False, default=""),
    Column("updated_at", DateTime(timezone=True), nullable=True),
    Column("updated_by", String(254), nullable=False, default=""),
    CheckConstraint("id = 1", name="rate_board_single_row"),
    CheckConstraint("cny_ngn IS NULL OR cny_ngn > 0", name="rate_board_cny_check"),
    CheckConstraint("usd_ngn IS NULL OR usd_ngn > 0", name="rate_board_usd_check"),
)


_engine: AsyncEngine | None = None
_schema_ready = False


def get_engine() -> AsyncEngine:
    global _engine
    if _engine is None:
        url, connect_args = get_settings().sqlalchemy_url
        _engine = create_async_engine(url, poolclass=NullPool, connect_args=connect_args)
    return _engine


async def reset_engine() -> None:
    """Dispose the engine (used by tests that swap databases)."""
    global _engine, _schema_ready
    if _engine is not None:
        await _engine.dispose()
    _engine = None
    _schema_ready = False


async def ensure_schema() -> None:
    """Create tables on first use. Idempotent, so concurrent cold starts are harmless."""
    global _schema_ready
    if _schema_ready:
        return
    engine = get_engine()
    for attempt in (1, 2):
        try:
            async with engine.begin() as conn:
                await conn.run_sync(metadata.create_all, checkfirst=True)
            break
        except SQLAlchemyError:
            if attempt == 2:
                raise
            log.warning("Schema creation raced with another instance; retrying")
    _schema_ready = True


class DatabaseUnavailable(Exception):
    """Raised when the database cannot be reached; mapped to HTTP 503."""


@asynccontextmanager
async def transaction() -> AsyncIterator[AsyncConnection]:
    """Open a connection in a transaction that commits on success and rolls back on error.

    Used explicitly inside handlers (not as a `yield` dependency) so the commit always
    completes before the response is returned, which matters on serverless platforms.
    """
    try:
        await ensure_schema()
        conn_cm = get_engine().begin()
        conn = await conn_cm.__aenter__()
    except (SQLAlchemyError, OSError) as exc:
        log.exception("Database unavailable: %s", exc)
        raise DatabaseUnavailable() from exc
    try:
        yield conn
    except BaseException as exc:
        await conn_cm.__aexit__(type(exc), exc, exc.__traceback__)
        raise
    try:
        await conn_cm.__aexit__(None, None, None)
    except (SQLAlchemyError, OSError) as exc:
        log.exception("Commit failed: %s", exc)
        raise DatabaseUnavailable() from exc


def as_utc(value: datetime | None) -> datetime | None:
    """SQLite drops tz info; treat naive timestamps as UTC."""
    if value is None:
        return None
    return value if value.tzinfo else value.replace(tzinfo=timezone.utc)

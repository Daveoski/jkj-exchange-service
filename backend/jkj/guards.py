"""Abuse protection: database-backed rate limiting and Cloudflare Turnstile verification.

Rate limits are stored in Postgres so they hold across every serverless instance.
"""
from __future__ import annotations

import logging
from datetime import timedelta

import httpx
from fastapi import HTTPException
from sqlalchemy import delete, func, insert, select
from sqlalchemy.ext.asyncio import AsyncConnection

from .config import get_settings
from .db import inquiries, inquiry_events, rate_events, utcnow
from .security import fingerprint

log = logging.getLogger("jkj")

TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"


async def hits(conn: AsyncConnection, bucket: str, key: str, window: timedelta) -> int:
    since = utcnow() - window
    return int(
        await conn.scalar(
            select(func.count())
            .select_from(rate_events)
            .where(
                rate_events.c.bucket == bucket,
                rate_events.c.key_hash == fingerprint(key),
                rate_events.c.created_at >= since,
            )
        )
        or 0
    )


async def record(conn: AsyncConnection, bucket: str, key: str) -> None:
    await conn.execute(insert(rate_events).values(bucket=bucket, key_hash=fingerprint(key)))


async def enforce(conn: AsyncConnection, bucket: str, key: str, limit: int, window: timedelta, message: str) -> None:
    if await hits(conn, bucket, key, window) >= limit:
        raise HTTPException(429, message)


ENQUIRY_RETENTION = timedelta(days=730)


async def prune(conn: AsyncConnection) -> None:
    """Housekeeping that enforces the privacy notice's retention promises.

    - Rate-limit rows older than two days are dropped.
    - Enquiries with no activity for 24 months are deleted, except "completed" ones,
      which may relate to a transaction and are kept for legal record-keeping.
    """
    now = utcnow()
    await conn.execute(delete(rate_events).where(rate_events.c.created_at < now - timedelta(days=2)))
    stale = select(inquiries.c.id).where(
        inquiries.c.updated_at < now - ENQUIRY_RETENTION, inquiries.c.status != "completed"
    )
    await conn.execute(delete(inquiry_events).where(inquiry_events.c.inquiry_id.in_(stale)))
    await conn.execute(delete(inquiries).where(inquiries.c.id.in_(stale)))


async def verify_turnstile(token: str, ip: str) -> None:
    settings = get_settings()
    secret = settings.turnstile_secret_key
    if not secret:
        if settings.require_turnstile:
            raise HTTPException(503, "Security verification is not configured")
        return
    if not token:
        raise HTTPException(400, "Please complete the security check")
    try:
        async with httpx.AsyncClient(timeout=8) as client:
            response = await client.post(TURNSTILE_VERIFY_URL, data={"secret": secret, "response": token, "remoteip": ip})
        ok = response.json().get("success") is True
    except (httpx.HTTPError, ValueError):
        log.exception("Turnstile verification unavailable")
        raise HTTPException(503, "Security verification is temporarily unavailable. Please try again.")
    if not ok:
        raise HTTPException(400, "Security check failed. Please retry.")

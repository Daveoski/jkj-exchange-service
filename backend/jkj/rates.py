"""Exchange-rate data for the website's rates pop-up.

Market rates are mid-market reference rates from the free, open currency-api dataset
(daily snapshots, so a 24-hour change can be computed), with ExchangeRate-API's open
endpoint as a fallback. They are cached in-process and at the CDN, so visitors never
call third parties directly and their IPs are never shared.

JKJ's own indicative rates are optional, entered by an admin, and stored in `rate_board`.
"""
from __future__ import annotations

import logging
import time
from datetime import date, datetime, timedelta, timezone

import httpx
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.dialects.sqlite import insert as sqlite_insert
from sqlalchemy.ext.asyncio import AsyncConnection

from .db import as_utc, rate_board, utcnow

log = logging.getLogger("jkj")

# (from, to) pairs shown on the website, in display order.
PAIRS: list[tuple[str, str]] = [("USD", "NGN"), ("CNY", "NGN"), ("USD", "CNY"), ("GBP", "NGN"), ("EUR", "NGN")]
CACHE_SECONDS = 30 * 60

_PRIMARY = "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@{tag}/v1/currencies/usd.json"
_MIRROR = "https://{tag}.currency-api.pages.dev/v1/currencies/usd.json"
_FALLBACK = "https://open.er-api.com/v6/latest/USD"

_cache: dict = {"at": 0.0, "data": None}


def _cross(usd_rates: dict[str, float], base: str, quote: str) -> float | None:
    """Rate for 1 unit of `base` in `quote`, from a USD-based table."""
    b = 1.0 if base == "USD" else usd_rates.get(base)
    q = 1.0 if quote == "USD" else usd_rates.get(quote)
    if not b or not q:
        return None
    return q / b


async def _currency_api(client: httpx.AsyncClient, tag: str) -> tuple[str, dict[str, float]] | None:
    for template in (_PRIMARY, _MIRROR):
        try:
            response = await client.get(template.format(tag=tag))
            if response.status_code == 200:
                body = response.json()
                return body["date"], {k.upper(): float(v) for k, v in body["usd"].items() if isinstance(v, (int, float))}
        except (httpx.HTTPError, ValueError, KeyError):
            continue
    return None


async def _fetch_market() -> dict | None:
    async with httpx.AsyncClient(timeout=6, follow_redirects=True) as client:
        latest = await _currency_api(client, "latest")
        previous = None
        source = "currency-api (open data, mid-market)"
        if latest:
            prev_day = (date.fromisoformat(latest[0]) - timedelta(days=1)).isoformat()
            previous = await _currency_api(client, prev_day)
        else:
            try:
                response = await client.get(_FALLBACK)
                body = response.json()
                if body.get("result") != "success":
                    return None
                as_of = datetime.fromtimestamp(body["time_last_update_unix"], timezone.utc).date().isoformat()
                latest = (as_of, {k: float(v) for k, v in body["rates"].items()})
                source = "ExchangeRate-API (open access, mid-market)"
            except (httpx.HTTPError, ValueError, KeyError):
                return None

    as_of, rates = latest
    prev_rates = previous[1] if previous else {}
    pairs = []
    for base, quote in PAIRS:
        rate = _cross(rates, base, quote)
        if rate is None:
            continue
        before = _cross(prev_rates, base, quote) if prev_rates else None
        change = round((rate - before) / before * 100, 2) if before else None
        pairs.append({"base": base, "quote": quote, "rate": round(rate, 4), "change_pct": change})
    if not pairs:
        return None
    return {"as_of": as_of, "source": source, "pairs": pairs, "fetched_at": utcnow().isoformat()}


async def market_rates() -> dict | None:
    """Cached market rates; serves the last good copy if a refresh fails.

    Concurrent cold misses may fetch twice, which is harmless and cheaper than locking.
    """
    if _cache["data"] and time.monotonic() - _cache["at"] < CACHE_SECONDS:
        return _cache["data"]
    fresh = await _fetch_market()
    if fresh:
        _cache.update(at=time.monotonic(), data=fresh)
    else:
        log.warning("Market rates unavailable; serving cached copy if any")
    return _cache["data"]


def _board_out(row) -> dict:
    return {
        "is_published": bool(row.is_published) if row else False,
        "cny_ngn": float(row.cny_ngn) if row and row.cny_ngn is not None else None,
        "usd_ngn": float(row.usd_ngn) if row and row.usd_ngn is not None else None,
        "note": row.note if row else "",
        "updated_at": as_utc(row.updated_at).isoformat() if row and row.updated_at else None,
        "updated_by": row.updated_by if row else "",
    }


async def get_board(conn: AsyncConnection) -> dict:
    row = (await conn.execute(select(rate_board).where(rate_board.c.id == 1))).first()
    return _board_out(row)


async def save_board(conn: AsyncConnection, values: dict, actor: str) -> dict:
    values = {**values, "updated_at": utcnow(), "updated_by": actor}
    insert = pg_insert if conn.dialect.name == "postgresql" else sqlite_insert
    statement = insert(rate_board).values(id=1, **values)
    await conn.execute(statement.on_conflict_do_update(index_elements=[rate_board.c.id], set_=values))
    return await get_board(conn)


def public_board(board: dict) -> dict | None:
    if not board["is_published"] or (board["cny_ngn"] is None and board["usd_ngn"] is None):
        return None
    return {k: board[k] for k in ("cny_ngn", "usd_ngn", "note", "updated_at")}

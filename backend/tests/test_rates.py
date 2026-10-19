import asyncio

import pytest

from conftest import CSRF
from jkj import rates


@pytest.fixture(autouse=True)
def fresh_cache():
    rates._cache.update(at=0.0, data=None)
    yield
    rates._cache.update(at=0.0, data=None)


def _fake_currency_api(today: dict, yesterday: dict | None):
    async def fake(client, tag):
        if tag == "latest":
            return "2026-10-18", today
        return ("2026-10-17", yesterday) if yesterday else None
    return fake


def test_cross_rates_and_daily_change(monkeypatch):
    monkeypatch.setattr(rates, "_currency_api", _fake_currency_api(
        {"NGN": 1500.0, "CNY": 7.5, "GBP": 0.75, "EUR": 0.9},
        {"NGN": 1485.0, "CNY": 7.5, "GBP": 0.75, "EUR": 0.9},
    ))
    data = asyncio.run(rates.market_rates())
    pairs = {(p["base"], p["quote"]): p for p in data["pairs"]}
    assert data["as_of"] == "2026-10-18"
    assert pairs[("USD", "NGN")]["rate"] == 1500.0
    assert pairs[("CNY", "NGN")]["rate"] == 200.0  # 1500 / 7.5
    assert pairs[("USD", "CNY")]["rate"] == 7.5
    assert pairs[("GBP", "NGN")]["rate"] == 2000.0
    assert pairs[("USD", "NGN")]["change_pct"] == 1.01
    assert pairs[("USD", "CNY")]["change_pct"] == 0.0


def test_last_good_copy_served_when_refresh_fails(monkeypatch):
    monkeypatch.setattr(rates, "_currency_api", _fake_currency_api({"NGN": 1500.0, "CNY": 7.5}, None))
    first = asyncio.run(rates.market_rates())
    rates._cache["at"] = 0.0  # expire

    async def broken():
        return None

    monkeypatch.setattr(rates, "_fetch_market", broken)
    assert asyncio.run(rates.market_rates()) == first


def test_public_rates_endpoint(client, monkeypatch):
    async def fake():
        return {"as_of": "2026-10-18", "source": "test", "pairs": [{"base": "USD", "quote": "NGN", "rate": 1500.0, "change_pct": None}], "fetched_at": "x"}

    monkeypatch.setattr("jkj.routes_public.market_rates", fake)
    response = client.get("/api/v1/rates")
    assert response.status_code == 200
    assert "s-maxage" in response.headers["cache-control"]
    body = response.json()
    assert body["market"]["pairs"][0]["rate"] == 1500.0
    assert body["jkj"] is None


def test_rates_unavailable_returns_503(client, monkeypatch):
    async def none():
        return None

    monkeypatch.setattr("jkj.routes_public.market_rates", none)
    assert client.get("/api/v1/rates").status_code == 503


def test_admin_publishes_jkj_rates(admin, monkeypatch):
    async def none():
        return None

    monkeypatch.setattr("jkj.routes_public.market_rates", none)
    assert admin.put("/api/v1/admin/rates", json={"is_published": True}, headers=CSRF).status_code == 400
    assert admin.put("/api/v1/admin/rates", json={"is_published": True, "cny_ngn": 215}).status_code == 403

    saved = admin.put(
        "/api/v1/admin/rates", json={"is_published": True, "cny_ngn": 215.5, "usd_ngn": 1550, "note": "Valid today"}, headers=CSRF
    ).json()
    assert saved["cny_ngn"] == 215.5 and saved["updated_by"] == "owner@example.com"

    public = admin.get("/api/v1/rates").json()
    assert public["jkj"]["cny_ngn"] == 215.5 and public["jkj"]["note"] == "Valid today"
    assert public["market"] is None

    admin.put("/api/v1/admin/rates", json={"is_published": False, "cny_ngn": 215.5}, headers=CSRF)
    assert admin.get("/api/v1/rates").status_code == 503  # nothing published, no market data
    assert admin.get("/api/v1/admin/rates").json()["is_published"] is False


def test_admin_rates_require_sign_in(client):
    assert client.get("/api/v1/admin/rates").status_code == 401
    assert client.put("/api/v1/admin/rates", json={"is_published": False}, headers=CSRF).status_code == 401

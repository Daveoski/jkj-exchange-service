import asyncio
import os
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

ADMIN_EMAIL = "owner@example.com"
ADMIN_PASSWORD = "Sup3r-Secret-Pass!"
CSRF = {"X-JKJ-Request": "1"}


@pytest.fixture()
def client(tmp_path, monkeypatch):
    """A TestClient backed by a fresh SQLite database, with email sending stubbed out."""
    env = {
        "DATABASE_URL": f"sqlite+aiosqlite:///{(tmp_path / 'test.db').as_posix()}",
        "DATABASE_URL_UNPOOLED": "",
        "JWT_SECRET": "test-secret-" + "x" * 40,
        "ADMIN_EMAIL": ADMIN_EMAIL,
        "ADMIN_PASSWORD": ADMIN_PASSWORD,
        "FRONTEND_URL": "http://localhost:3000",
        "RESEND_API_KEY": "re_test",
        "NOTIFICATION_TO_EMAIL": "team@example.org",
        "TURNSTILE_SECRET_KEY": "",
        "REQUIRE_TURNSTILE": "false",
        "PROXY_SECRET": "proxy-secret",
        "VERCEL_ENV": "",
    }
    for key, value in env.items():
        monkeypatch.setenv(key, value)

    from jkj import config, db

    config.get_settings.cache_clear()
    asyncio.run(db.reset_engine())

    sent: list[dict] = []

    async def fake_send(client, **job):
        from jkj.emails import EmailResult

        sent.append(job)
        return EmailResult(job["to"], True)

    from jkj import emails

    monkeypatch.setattr(emails, "_send", fake_send)

    from fastapi.testclient import TestClient
    from jkj.main import create_app

    with TestClient(create_app()) as test_client:
        test_client.sent_emails = sent
        yield test_client

    asyncio.run(db.reset_engine())
    config.get_settings.cache_clear()


def inquiry(**overrides):
    body = {
        "full_name": "Ada Obi",
        "email": "ada@example.com",
        "phone": "+234 803 123 4567",
        "company": "Obi Imports Ltd",
        "service": "rmb",
        "currency": "CNY",
        "amount": 25000,
        "contact_method": "WhatsApp",
        "message": "I need to pay a supplier in Guangzhou for an electronics order.",
        "consent": True,
    }
    body.update(overrides)
    return body


def login(client, email=ADMIN_EMAIL, password=ADMIN_PASSWORD):
    return client.post("/api/v1/admin/login", json={"email": email, "password": password}, headers=CSRF)


@pytest.fixture()
def admin(client):
    response = login(client)
    assert response.status_code == 200, response.text
    return client

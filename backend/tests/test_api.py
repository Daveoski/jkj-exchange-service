import re

from conftest import ADMIN_EMAIL, ADMIN_PASSWORD, CSRF, inquiry, login


# ------------------------------------------------------------------ public

def test_health_reports_database(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["database"] == "ok"
    assert body["email"] == "configured"


def test_create_inquiry_returns_reference_and_sends_emails(client):
    response = client.post("/api/v1/inquiries", json=inquiry())
    assert response.status_code == 201, response.text
    reference = response.json()["reference"]
    assert re.fullmatch(r"JKJ-[2-9A-HJ-NP-Z]{6}", reference)

    recipients = sorted(job["to"] for job in client.sent_emails)
    assert recipients == ["ada@example.com", "team@example.org"]
    team = next(j for j in client.sent_emails if j["to"] == "team@example.org")
    assert reference in team["subject"]
    assert team["reply_to"] == "ada@example.com"
    assert "Obi Imports Ltd" in team["html"]


def test_user_input_is_escaped_in_emails(client):
    client.post("/api/v1/inquiries", json=inquiry(full_name="<script>x</script> Bob", message="<b>bold</b> request please"))
    team = next(j for j in client.sent_emails if j["to"] == "team@example.org")
    assert "<script>" not in team["html"]
    assert "&lt;script&gt;" in team["html"]


def test_consent_is_required(client):
    assert client.post("/api/v1/inquiries", json=inquiry(consent=False)).status_code == 400


def test_validation_errors_are_readable(client):
    response = client.post("/api/v1/inquiries", json=inquiry(phone="abc", email="not-an-email"))
    assert response.status_code == 422
    body = response.json()
    assert set(body["errors"]) >= {"phone", "email"}
    assert isinstance(body["detail"], str)


def test_unknown_fields_rejected(client):
    assert client.post("/api/v1/inquiries", json=inquiry(status="completed")).status_code == 422


def test_honeypot_pretends_success_but_stores_nothing(admin):
    response = admin.post("/api/v1/inquiries", json=inquiry(website="http://spam"))
    assert response.status_code == 201
    assert admin.get("/api/v1/admin/inquiries").json()["total"] == 0
    assert admin.sent_emails == []


def test_rate_limit_by_email(client):
    for _ in range(5):
        assert client.post("/api/v1/inquiries", json=inquiry()).status_code == 201
    assert client.post("/api/v1/inquiries", json=inquiry()).status_code == 429


def test_rate_limit_by_proxied_ip(client):
    headers = {"x-jkj-proxy-secret": "proxy-secret", "x-jkj-client-ip": "203.0.113.9"}
    for i in range(6):
        assert client.post("/api/v1/inquiries", json=inquiry(email=f"u{i}@example.com"), headers=headers).status_code == 201
    assert client.post("/api/v1/inquiries", json=inquiry(email="new@example.com"), headers=headers).status_code == 429
    # A different visitor behind the same proxy is unaffected.
    other = {**headers, "x-jkj-client-ip": "198.51.100.7"}
    assert client.post("/api/v1/inquiries", json=inquiry(email="other@example.com"), headers=other).status_code == 201


def test_spoofed_proxy_ip_is_ignored(client):
    headers = {"x-jkj-proxy-secret": "wrong", "x-jkj-client-ip": "203.0.113.9"}
    for i in range(6):
        client.post("/api/v1/inquiries", json=inquiry(email=f"s{i}@example.com"), headers=headers)
    # All counted against the real client, so rotating the fake header does not help.
    rotated = {**headers, "x-jkj-client-ip": "198.51.100.1"}
    assert client.post("/api/v1/inquiries", json=inquiry(email="z@example.com"), headers=rotated).status_code == 429


# ------------------------------------------------------------------ auth

def test_admin_endpoints_require_sign_in(client):
    for url in ("/api/v1/admin/me", "/api/v1/admin/inquiries", "/api/v1/admin/stats", "/api/v1/admin/inquiries/export"):
        assert client.get(url).status_code == 401


def test_login_requires_csrf_header(client):
    response = client.post("/api/v1/admin/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert response.status_code == 403


def test_login_sets_httponly_cookie(client):
    response = login(client)
    assert response.status_code == 200
    cookie = response.headers["set-cookie"]
    assert "jkj_admin=" in cookie and "HttpOnly" in cookie and "SameSite=lax" in cookie
    assert client.get("/api/v1/admin/me").json()["email"] == ADMIN_EMAIL


def test_wrong_password_rejected_and_rate_limited(client):
    for _ in range(8):
        assert login(client, password="wrong-password").status_code == 401
    assert login(client).status_code == 429


def test_logout_clears_session(admin):
    assert admin.post("/api/v1/admin/logout", headers=CSRF).status_code == 204
    assert admin.get("/api/v1/admin/me").status_code == 401


def test_tampered_token_rejected(client):
    client.cookies.set("jkj_admin", "eyJhbGciOiJIUzI1NiJ9.e30.invalid")
    assert client.get("/api/v1/admin/me").status_code == 401


def test_password_change_revokes_old_sessions(admin):
    old_token = admin.cookies.get("jkj_admin")
    new_password = "N3w-Strong-Passw0rd"
    response = admin.post(
        "/api/v1/admin/password",
        json={"current_password": ADMIN_PASSWORD, "new_password": new_password},
        headers=CSRF,
    )
    assert response.status_code == 204
    assert admin.get("/api/v1/admin/me").status_code == 200  # current session re-issued
    assert admin.get("/api/v1/admin/me", cookies={"jkj_admin": old_token}).status_code == 401
    admin.cookies.clear()
    assert login(admin).status_code == 401
    assert login(admin, password=new_password).status_code == 200


def test_password_change_enforces_strength(admin):
    response = admin.post(
        "/api/v1/admin/password", json={"current_password": ADMIN_PASSWORD, "new_password": "alllowercase"}, headers=CSRF
    )
    assert response.status_code == 422


# ------------------------------------------------------------------ management

def _seed(client, count=3):
    refs = []
    for i in range(count):
        r = client.post(
            "/api/v1/inquiries",
            json=inquiry(full_name=f"Customer {i}", email=f"c{i}@example.com", service=["rmb", "usd", "alipay"][i % 3]),
        )
        refs.append(r.json()["reference"])
    return refs


def test_list_search_filter_and_paginate(admin):
    refs = _seed(admin, 3)
    page = admin.get("/api/v1/admin/inquiries").json()
    assert page["total"] == 3
    assert page["items"][0]["full_name"] == "Customer 2"  # newest first
    assert page["items"][0]["email_status"] == "sent"

    assert admin.get("/api/v1/admin/inquiries", params={"search": "customer 1"}).json()["total"] == 1
    assert admin.get("/api/v1/admin/inquiries", params={"search": refs[0]}).json()["total"] == 1
    assert admin.get("/api/v1/admin/inquiries", params={"service": "usd"}).json()["total"] == 1
    assert admin.get("/api/v1/admin/inquiries", params={"search": "100%_"}).json()["total"] == 0
    paged = admin.get("/api/v1/admin/inquiries", params={"limit": 2, "offset": 2}).json()
    assert len(paged["items"]) == 1


def test_update_status_and_notes_records_timeline(admin):
    _seed(admin, 1)
    item = admin.get("/api/v1/admin/inquiries").json()["items"][0]
    url = f"/api/v1/admin/inquiries/{item['id']}"

    assert admin.patch(url, json={"status": "contacted"}).status_code == 403  # missing CSRF header
    response = admin.patch(url, json={"status": "contacted", "admin_notes": "Called, sending quote"}, headers=CSRF)
    assert response.status_code == 200
    detail = response.json()
    assert detail["status"] == "contacted"
    assert detail["admin_notes"] == "Called, sending quote"
    kinds = [e["kind"] for e in detail["events"]]
    assert {"created", "email", "status", "note"} <= set(kinds)

    assert admin.get("/api/v1/admin/inquiries", params={"status": "contacted"}).json()["total"] == 1
    assert admin.patch(url, json={"status": "bogus"}, headers=CSRF).status_code == 422


def test_stats(admin):
    _seed(admin, 3)
    stats = admin.get("/api/v1/admin/stats").json()
    assert stats["total"] == 3
    assert stats["by_status"]["new"] == 3
    assert stats["by_service"] == {"rmb": 1, "usd": 1, "alipay": 1}
    assert stats["last_7_days"] == 3
    assert len(stats["daily"]) == 30
    assert stats["daily"][-1]["count"] == 3


def test_export_csv_neutralises_formulas(admin):
    admin.post("/api/v1/inquiries", json=inquiry(full_name="=HYPERLINK Evil", email="evil@example.com"))
    response = admin.get("/api/v1/admin/inquiries/export")
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/csv")
    assert "'=HYPERLINK Evil" in response.text


def test_delete_inquiry(admin):
    _seed(admin, 1)
    item_id = admin.get("/api/v1/admin/inquiries").json()["items"][0]["id"]
    assert admin.delete(f"/api/v1/admin/inquiries/{item_id}", headers=CSRF).status_code == 204
    assert admin.get(f"/api/v1/admin/inquiries/{item_id}").status_code == 404
    assert admin.delete(f"/api/v1/admin/inquiries/{item_id}", headers=CSRF).status_code == 404


def test_retention_purges_stale_enquiries_but_keeps_completed(admin):
    import asyncio
    from datetime import timedelta

    from sqlalchemy import update

    from jkj.db import inquiries, transaction, utcnow
    from jkj.guards import prune

    _seed(admin, 3)
    items = admin.get("/api/v1/admin/inquiries").json()["items"]
    admin.patch(f"/api/v1/admin/inquiries/{items[0]['id']}", json={"status": "completed"}, headers=CSRF)

    async def age_all_and_prune():
        async with transaction() as conn:
            await conn.execute(update(inquiries).values(updated_at=utcnow() - timedelta(days=800)))
            await prune(conn)

    asyncio.run(age_all_and_prune())
    remaining = admin.get("/api/v1/admin/inquiries").json()["items"]
    assert [r["id"] for r in remaining] == [items[0]["id"]]


def test_admin_responses_are_not_cached(admin):
    assert admin.get("/api/v1/admin/me").headers["cache-control"] == "no-store"

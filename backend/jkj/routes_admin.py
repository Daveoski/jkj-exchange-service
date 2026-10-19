"""Private admin API: authentication, enquiry management, statistics and export."""
from __future__ import annotations

import csv
import io
from datetime import date, datetime, timedelta, timezone
from typing import Literal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response
from fastapi.responses import StreamingResponse
from sqlalchemy import Select, delete, func, insert, or_, select, update
from sqlalchemy.engine import Row

from .config import get_settings
from .db import admin_users, as_utc, inquiries, inquiry_events, transaction, utcnow
from .guards import enforce, record
from .schemas import (
    STATUS_LABELS,
    AdminOut,
    DailyCount,
    InquiryDetail,
    InquiryEventOut,
    InquiryOut,
    InquiryPage,
    InquiryUpdate,
    LoginIn,
    PasswordChangeIn,
    Service,
    Stats,
    Status,
)
from .security import (
    Admin,
    authenticate,
    bootstrap_admin,
    clear_session_cookie,
    client_ip,
    current_admin,
    hash_password,
    issue_token,
    require_csrf_header,
    set_session_cookie,
    verify_password,
)

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])
LAGOS = timezone(timedelta(hours=1))  # West Africa Time, no daylight saving


def _inquiry(row: Row) -> InquiryOut:
    data = dict(row._mapping)
    data["amount"] = float(data["amount"]) if data["amount"] is not None else None
    data["created_at"] = as_utc(data["created_at"])
    data["updated_at"] = as_utc(data["updated_at"])
    return InquiryOut.model_validate({k: v for k, v in data.items() if k in InquiryOut.model_fields})


def _filtered(query: Select, status: str | None, service: str | None, search: str) -> Select:
    if status:
        query = query.where(inquiries.c.status == status)
    if service:
        query = query.where(inquiries.c.service == service)
    term = search.strip()
    if term:
        escaped = term.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
        pattern = f"%{escaped}%"
        query = query.where(
            or_(*(col.ilike(pattern, escape="\\") for col in (
                inquiries.c.full_name, inquiries.c.email, inquiries.c.phone,
                inquiries.c.reference, inquiries.c.company, inquiries.c.message,
            )))
        )
    return query


# ---------------------------------------------------------------- authentication

@router.post("/login", response_model=AdminOut, dependencies=[Depends(require_csrf_header)])
async def login(body: LoginIn, request: Request, response: Response) -> AdminOut:
    settings = get_settings()
    key = f"{client_ip(request)}|{body.email.lower()}"
    async with transaction() as conn:
        await bootstrap_admin(conn)
        await enforce(
            conn, "login", key, settings.login_attempts_per_15m, timedelta(minutes=15),
            "Too many sign-in attempts. Please wait 15 minutes and try again.",
        )
        row = await authenticate(conn, body.email, body.password)
        if row is None:
            await record(conn, "login", key)  # committed below, before the 401 is raised
    if row is None:
        raise HTTPException(401, "Incorrect email or password.")
    set_session_cookie(response, issue_token(row.id, row.email, row.token_version))
    return AdminOut(id=row.id, email=row.email, last_login_at=as_utc(row.last_login_at))


@router.post("/logout", status_code=204, dependencies=[Depends(require_csrf_header)])
async def logout(response: Response) -> Response:
    clear_session_cookie(response)
    response.status_code = 204
    return response


@router.get("/me", response_model=AdminOut)
async def me(admin: Admin = Depends(current_admin)) -> AdminOut:
    async with transaction() as conn:
        last = await conn.scalar(select(admin_users.c.last_login_at).where(admin_users.c.id == admin.id))
    return AdminOut(id=admin.id, email=admin.email, last_login_at=as_utc(last))


@router.post("/password", status_code=204, dependencies=[Depends(require_csrf_header)])
async def change_password(body: PasswordChangeIn, response: Response, admin: Admin = Depends(current_admin)) -> Response:
    async with transaction() as conn:
        row = (await conn.execute(select(admin_users).where(admin_users.c.id == admin.id))).first()
        valid = row is not None and verify_password(body.current_password, row.password_hash)
        if valid:
            new_version = row.token_version + 1
            await conn.execute(
                update(admin_users)
                .where(admin_users.c.id == admin.id)
                .values(password_hash=hash_password(body.new_password), token_version=new_version)
            )
    if not valid:
        raise HTTPException(400, "Your current password is incorrect.")
    # Bumping token_version signs out every other session; keep this one signed in.
    set_session_cookie(response, issue_token(admin.id, admin.email, new_version))
    response.status_code = 204
    return response


# ---------------------------------------------------------------- statistics

@router.get("/stats", response_model=Stats)
async def stats(admin: Admin = Depends(current_admin)) -> Stats:
    now = utcnow()
    since_30 = now - timedelta(days=30)
    async with transaction() as conn:
        by_status = dict((await conn.execute(select(inquiries.c.status, func.count()).group_by(inquiries.c.status))).all())
        by_service = dict((await conn.execute(select(inquiries.c.service, func.count()).group_by(inquiries.c.service))).all())
        recent = (await conn.scalars(select(inquiries.c.created_at).where(inquiries.c.created_at >= since_30))).all()

    today = now.astimezone(LAGOS).date()
    buckets: dict[date, int] = {today - timedelta(days=i): 0 for i in range(29, -1, -1)}
    last_7 = 0
    for created in recent:
        created = as_utc(created)
        day = created.astimezone(LAGOS).date()
        if day in buckets:
            buckets[day] += 1
        if created >= now - timedelta(days=7):
            last_7 += 1
    return Stats(
        total=sum(by_status.values()),
        by_status={s: int(by_status.get(s, 0)) for s in STATUS_LABELS},
        by_service={k: int(v) for k, v in by_service.items()},
        last_7_days=last_7,
        last_30_days=len(recent),
        daily=[DailyCount(date=d.isoformat(), count=c) for d, c in buckets.items()],
    )


# ---------------------------------------------------------------- enquiries

@router.get("/inquiries", response_model=InquiryPage)
async def list_inquiries(
    status: Status | None = None,
    service: Service | None = None,
    search: str = Query(default="", max_length=100),
    sort: Literal["newest", "oldest"] = "newest",
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    admin: Admin = Depends(current_admin),
) -> InquiryPage:
    order = inquiries.c.created_at.desc() if sort == "newest" else inquiries.c.created_at.asc()
    async with transaction() as conn:
        total = await conn.scalar(_filtered(select(func.count()).select_from(inquiries), status, service, search))
        rows = (await conn.execute(_filtered(select(inquiries), status, service, search).order_by(order).limit(limit).offset(offset))).all()
    return InquiryPage(items=[_inquiry(r) for r in rows], total=int(total or 0), limit=limit, offset=offset)


_CSV_COLUMNS = ["reference", "created_at", "status", "full_name", "company", "email", "phone", "service",
                "currency", "amount", "contact_method", "message", "admin_notes", "email_status"]


def _csv_safe(value: object) -> str:
    text = "" if value is None else str(value)
    # Neutralise spreadsheet formula injection.
    return "'" + text if text[:1] in ("=", "+", "-", "@", "\t", "\r") else text


@router.get("/inquiries/export")
async def export_inquiries(
    status: Status | None = None,
    service: Service | None = None,
    search: str = Query(default="", max_length=100),
    admin: Admin = Depends(current_admin),
) -> StreamingResponse:
    async with transaction() as conn:
        rows = (await conn.execute(
            _filtered(select(inquiries), status, service, search).order_by(inquiries.c.created_at.desc()).limit(10000)
        )).all()
    buffer = io.StringIO()
    buffer.write("﻿")  # BOM so Excel opens UTF-8 correctly
    writer = csv.writer(buffer)
    writer.writerow(_CSV_COLUMNS)
    for row in rows:
        item = _inquiry(row).model_dump()
        item["created_at"] = item["created_at"].astimezone(LAGOS).strftime("%Y-%m-%d %H:%M")
        writer.writerow([_csv_safe(item[c]) for c in _CSV_COLUMNS])
    filename = f"jkj-enquiries-{datetime.now(LAGOS):%Y%m%d-%H%M}.csv"
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


async def _detail(conn, item_id: UUID) -> InquiryDetail:
    row = (await conn.execute(select(inquiries).where(inquiries.c.id == item_id))).first()
    if row is None:
        raise HTTPException(404, "Enquiry not found")
    events = (await conn.execute(
        select(inquiry_events).where(inquiry_events.c.inquiry_id == item_id).order_by(inquiry_events.c.created_at.desc())
    )).all()
    return InquiryDetail(
        **_inquiry(row).model_dump(),
        events=[
            InquiryEventOut(id=e.id, created_at=as_utc(e.created_at), actor=e.actor, kind=e.kind, detail=e.detail)
            for e in events
        ],
    )


@router.get("/inquiries/{item_id}", response_model=InquiryDetail)
async def get_inquiry(item_id: UUID, admin: Admin = Depends(current_admin)) -> InquiryDetail:
    async with transaction() as conn:
        return await _detail(conn, item_id)


@router.patch("/inquiries/{item_id}", response_model=InquiryDetail, dependencies=[Depends(require_csrf_header)])
async def update_inquiry(item_id: UUID, body: InquiryUpdate, admin: Admin = Depends(current_admin)) -> InquiryDetail:
    async with transaction() as conn:
        current = (await conn.execute(select(inquiries.c.status, inquiries.c.admin_notes).where(inquiries.c.id == item_id))).first()
        if current is None:
            raise HTTPException(404, "Enquiry not found")
        changes: dict = {}
        events: list[tuple[str, str]] = []
        if body.status is not None and body.status != current.status:
            changes["status"] = body.status
            events.append(("status", f"{STATUS_LABELS[current.status]} → {STATUS_LABELS[body.status]}"))
        if body.admin_notes is not None and body.admin_notes.strip() != current.admin_notes:
            changes["admin_notes"] = body.admin_notes.strip()
            events.append(("note", "Updated private notes"))
        if changes:
            changes["updated_at"] = utcnow()
            await conn.execute(update(inquiries).where(inquiries.c.id == item_id).values(**changes))
            for kind, detail in events:
                await conn.execute(insert(inquiry_events).values(inquiry_id=item_id, actor=admin.email, kind=kind, detail=detail))
        return await _detail(conn, item_id)


@router.delete("/inquiries/{item_id}", status_code=204, dependencies=[Depends(require_csrf_header)])
async def delete_inquiry(item_id: UUID, admin: Admin = Depends(current_admin)) -> Response:
    async with transaction() as conn:
        await conn.execute(delete(inquiry_events).where(inquiry_events.c.inquiry_id == item_id))
        result = await conn.execute(delete(inquiries).where(inquiries.c.id == item_id))
        if result.rowcount == 0:
            raise HTTPException(404, "Enquiry not found")
    return Response(status_code=204)

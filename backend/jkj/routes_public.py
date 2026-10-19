"""Public endpoints: health check and the website enquiry form."""
from __future__ import annotations

import logging
import random
import secrets
from datetime import timedelta

from fastapi import APIRouter, HTTPException, Request, Response
from sqlalchemy import insert, text, update
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from . import __version__
from .config import get_settings
from .db import DatabaseUnavailable, inquiries, inquiry_events, transaction
from .emails import send_inquiry_emails
from .guards import enforce, prune, record, verify_turnstile
from .schemas import InquiryCreated, InquiryIn
from .security import client_ip, fingerprint

log = logging.getLogger("jkj")
router = APIRouter(prefix="/api/v1", tags=["public"])

_REFERENCE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"  # no 0/O/1/I to avoid misreading
RECEIVED = "Thank you. Your enquiry has been received and our team will be in touch."


def new_reference() -> str:
    return "JKJ-" + "".join(secrets.choice(_REFERENCE_ALPHABET) for _ in range(6))


@router.get("/health")
async def health(response: Response):
    settings = get_settings()
    database = "ok"
    try:
        async with transaction() as conn:
            await conn.execute(text("SELECT 1"))
    except (DatabaseUnavailable, SQLAlchemyError, OSError):
        database = "unavailable"
        response.status_code = 503
    return {
        "status": "ok" if database == "ok" else "degraded",
        "service": "JKJ Exchange Services API",
        "version": __version__,
        "database": database,
        "email": "configured" if settings.resend_api_key else "disabled",
        "turnstile": "enabled" if settings.turnstile_secret_key else "disabled",
    }


@router.post("/inquiries", status_code=201, response_model=InquiryCreated)
async def create_inquiry(item: InquiryIn, request: Request) -> InquiryCreated:
    if item.website:
        # Honeypot filled in: pretend success so bots learn nothing, but store nothing.
        return InquiryCreated(reference=new_reference(), message=RECEIVED)
    if not item.consent:
        raise HTTPException(400, "Please confirm that JKJ may use your details to respond to your enquiry.")

    settings = get_settings()
    ip = client_ip(request)
    await verify_turnstile(item.turnstile_token, ip)

    data = item.model_dump(exclude={"website", "turnstile_token", "consent"})
    async with transaction() as conn:
        if random.random() < 0.05:
            await prune(conn)
        await enforce(
            conn, "inquiry-ip", ip, settings.inquiries_per_ip_per_hour, timedelta(hours=1),
            "You've sent several enquiries in a short time. Please wait a little or contact us on WhatsApp.",
        )
        await enforce(
            conn, "inquiry-email", data["email"], settings.inquiries_per_email_per_day, timedelta(days=1),
            "We've already received several enquiries from this email today. Our team will be in touch.",
        )
        row = None
        for _ in range(5):
            reference = new_reference()
            try:
                async with conn.begin_nested():
                    row = (
                        await conn.execute(
                            insert(inquiries)
                            .values(**data, reference=reference, client_hash=fingerprint(ip)[:32])
                            .returning(inquiries.c.id, inquiries.c.reference)
                        )
                    ).first()
                break
            except IntegrityError:
                continue  # astronomically rare reference collision; draw another
        if row is None:
            raise HTTPException(500, "Could not save your enquiry. Please try again.")
        await conn.execute(
            insert(inquiry_events).values(inquiry_id=row.id, actor="website", kind="created", detail="Submitted via website form")
        )
        await record(conn, "inquiry-ip", ip)
        await record(conn, "inquiry-email", data["email"])

    # The enquiry is safely committed; email is best-effort from here on.
    stored = {**data, "id": str(row.id), "reference": row.reference}
    try:
        email_status, results = await send_inquiry_emails(stored)
    except Exception:  # never let an email problem turn a saved enquiry into an error
        log.exception("Unexpected error sending emails for %s", row.reference)
        email_status, results = "failed", []
    try:
        async with transaction() as conn:
            await conn.execute(update(inquiries).where(inquiries.c.id == row.id).values(email_status=email_status))
            if results:
                summary = ", ".join(f"{r.recipient}: {'delivered to Resend' if r.ok else 'failed — ' + (r.detail or 'error')}" for r in results)
                await conn.execute(
                    insert(inquiry_events).values(inquiry_id=row.id, actor="system", kind="email", detail=summary[:2000])
                )
    except DatabaseUnavailable:
        log.warning("Could not record email status for %s", row.reference)

    return InquiryCreated(reference=row.reference, message=RECEIVED)

"""Transactional email through Resend: a team alert and a customer confirmation.

Every message is sent individually so one rejected recipient (for example while the
Resend account is still in sandbox mode without a verified domain) never blocks the rest.
A failed email never loses an enquiry: it is already saved before any email is attempted.
"""
from __future__ import annotations

import asyncio
import logging
from dataclasses import dataclass
from html import escape
from urllib.parse import quote

import httpx

from .config import get_settings
from .schemas import SERVICE_LABELS

log = logging.getLogger("jkj")

RESEND_URL = "https://api.resend.com/emails"
WHATSAPP_NUMBER = "2348039622879"
PHONE_DISPLAY = "+234 811 873 1958"
PHONE_TEL = "+2348118731958"
WHATSAPP_DISPLAY = "+234 803 962 2879"

MIDNIGHT = "#071425"
GOLD = "#E6B35E"
INK = "#132436"
MUTED = "#5b6b7d"


@dataclass(frozen=True)
class EmailResult:
    recipient: str
    ok: bool
    detail: str = ""


def _money(amount: float | None, currency: str) -> str:
    if amount is None:
        return "Not specified"
    return f"{amount:,.2f} {currency}"


def _whatsapp_for(phone: str, name: str) -> str:
    digits = "".join(ch for ch in phone if ch.isdigit())
    if digits.startswith("0"):
        digits = "234" + digits[1:]
    text = quote(f"Hello {name}, this is JKJ Exchange Services following up on your website enquiry.")
    return f"https://wa.me/{digits}?text={text}"


def _layout(preheader: str, body: str) -> str:
    return f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light"><title>JKJ Exchange Services</title></head>
<body style="margin:0;padding:0;background:#eef2f5;font-family:Helvetica,Arial,sans-serif;color:{INK};">
<span style="display:none;max-height:0;overflow:hidden;opacity:0">{escape(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef2f5;padding:32px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:20px;overflow:hidden;">
<tr><td style="background:{MIDNIGHT};padding:28px 32px;">
<table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td style="background:{GOLD};color:{MIDNIGHT};font-weight:900;font-size:15px;letter-spacing:-0.5px;padding:10px 11px;border-radius:10px;">JKJ</td>
<td style="padding-left:12px;color:#ffffff;font-weight:800;font-size:15px;letter-spacing:1px;">JKJ <span style="color:{GOLD};">EXCHANGE</span><br>
<span style="color:#9fb0c2;font-size:10px;letter-spacing:4px;font-weight:600;">SERVICES</span></td>
</tr></table></td></tr>
<tr><td style="padding:32px;">{body}</td></tr>
<tr><td style="background:#f6f8fa;padding:22px 32px;font-size:12px;line-height:20px;color:{MUTED};">
JKJ Exchange Services &middot; Nigeria &middot; International supplier-payment enquiries<br>
WhatsApp {WHATSAPP_DISPLAY} &middot; Call {PHONE_DISPLAY}<br>
No payments are processed by email or on our website. JKJ will never ask for your passwords, PINs or card numbers.
</td></tr>
</table></td></tr></table></body></html>"""


def _button(href: str, label: str, primary: bool = True) -> str:
    bg, fg = (GOLD, MIDNIGHT) if primary else ("#ffffff", MIDNIGHT)
    border = GOLD if primary else "#d5dde5"
    return (
        f'<a href="{escape(href, quote=True)}" style="display:inline-block;margin:4px 6px 4px 0;padding:12px 20px;'
        f"background:{bg};color:{fg};border:1px solid {border};border-radius:999px;font-weight:700;"
        f'font-size:14px;text-decoration:none;">{escape(label)}</a>'
    )


def _rows(pairs: list[tuple[str, str]]) -> str:
    cells = "".join(
        f'<tr><td style="padding:10px 0;border-bottom:1px solid #edf1f4;color:{MUTED};font-size:13px;width:38%;vertical-align:top;">{escape(k)}</td>'
        f'<td style="padding:10px 0;border-bottom:1px solid #edf1f4;font-size:14px;font-weight:600;vertical-align:top;">{escape(v)}</td></tr>'
        for k, v in pairs
    )
    return f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0">{cells}</table>'


def team_alert(item: dict) -> tuple[str, str, str]:
    settings = get_settings()
    service = SERVICE_LABELS.get(item["service"], item["service"])
    subject = f"New enquiry {item['reference']} · {service} · {item['full_name']}"
    dashboard = f"{settings.public_site_url}/admin?inquiry={item['id']}"
    pairs = [
        ("Reference", item["reference"]),
        ("Name", item["full_name"]),
        ("Company", item.get("company") or "—"),
        ("Email", item["email"]),
        ("Phone / WhatsApp", item["phone"]),
        ("Enquiry", service),
        ("Currency", item["currency"]),
        ("Approx. amount", _money(item.get("amount"), item["currency"])),
        ("Preferred reply", item["contact_method"]),
    ]
    message_html = escape(item["message"]).replace("\n", "<br>")
    body = f"""
<p style="margin:0 0 6px;color:#a46b14;font-size:12px;font-weight:800;letter-spacing:2px;">NEW WEBSITE ENQUIRY</p>
<h1 style="margin:0 0 18px;font-family:Georgia,serif;font-size:28px;line-height:34px;color:{MIDNIGHT};font-weight:400;">{escape(item['full_name'])} wants to talk about {escape(service.lower())}.</h1>
{_rows(pairs)}
<p style="margin:24px 0 8px;color:{MUTED};font-size:12px;font-weight:800;letter-spacing:2px;">MESSAGE</p>
<div style="background:#f6f8fa;border-radius:14px;padding:16px 18px;font-size:14px;line-height:22px;">{message_html}</div>
<div style="margin-top:26px;">
{_button(_whatsapp_for(item['phone'], item['full_name']), 'WhatsApp client')}
{_button('mailto:' + item['email'] + '?subject=' + quote('Re: Your JKJ enquiry ' + item['reference']), 'Email client', False)}
{_button(dashboard, 'Open in dashboard', False)}
</div>
<p style="margin:22px 0 0;font-size:12px;color:{MUTED};">Reply to this email to respond to the customer directly.</p>"""
    text = (
        f"New website enquiry {item['reference']}\n\n"
        + "\n".join(f"{k}: {v}" for k, v in pairs)
        + f"\n\nMessage:\n{item['message']}\n\nOpen in dashboard: {dashboard}\n"
    )
    return subject, _layout(f"{item['full_name']} · {service}", body), text


def customer_confirmation(item: dict) -> tuple[str, str, str]:
    service = SERVICE_LABELS.get(item["service"], item["service"])
    first_name = item["full_name"].split(" ")[0]
    subject = f"We've received your enquiry ({item['reference']}) — JKJ Exchange Services"
    whatsapp = f"https://wa.me/{WHATSAPP_NUMBER}?text=" + quote(f"Hello JKJ, I'm following up on enquiry {item['reference']}.")
    pairs = [
        ("Reference", item["reference"]),
        ("Enquiry", service),
        ("Currency", item["currency"]),
        ("Approx. amount", _money(item.get("amount"), item["currency"])),
        ("We'll reply by", item["contact_method"]),
    ]
    body = f"""
<p style="margin:0 0 6px;color:#a46b14;font-size:12px;font-weight:800;letter-spacing:2px;">ENQUIRY RECEIVED</p>
<h1 style="margin:0 0 14px;font-family:Georgia,serif;font-size:30px;line-height:36px;color:{MIDNIGHT};font-weight:400;">Thank you, {escape(first_name)}.</h1>
<p style="margin:0 0 22px;font-size:15px;line-height:24px;color:{INK};">Your enquiry is with our team. We'll review the details and contact you by <strong>{escape(item['contact_method'].lower())}</strong> to discuss options, requirements and a tailored quote.</p>
{_rows(pairs)}
<p style="margin:26px 0 8px;color:{MUTED};font-size:12px;font-weight:800;letter-spacing:2px;">WHAT HAPPENS NEXT</p>
<ol style="margin:0;padding-left:18px;font-size:14px;line-height:24px;color:{INK};">
<li>We review your enquiry and the payment channel your supplier needs.</li>
<li>We contact you to discuss available routes, documentation and terms.</li>
<li>You decide whether to proceed — nothing happens without your confirmation.</li>
</ol>
<div style="margin-top:26px;">{_button(whatsapp, 'Chat on WhatsApp')}{_button('tel:' + PHONE_TEL, 'Call ' + PHONE_DISPLAY, False)}</div>
<p style="margin:24px 0 0;padding:14px 16px;background:#fff8ec;border-radius:12px;font-size:13px;line-height:20px;color:#7a5512;">
For your security, please never send passwords, PINs, card numbers or identity documents by email.</p>"""
    text = (
        f"Thank you, {first_name}.\n\nYour enquiry {item['reference']} has been received. "
        f"We'll contact you by {item['contact_method'].lower()}.\n\n"
        + "\n".join(f"{k}: {v}" for k, v in pairs)
        + f"\n\nWhatsApp: {WHATSAPP_DISPLAY}\nCall: {PHONE_DISPLAY}\n\n"
        "For your security, never send passwords, PINs or card numbers by email.\n— JKJ Exchange Services"
    )
    return subject, _layout(f"Reference {item['reference']} · we'll be in touch", body), text


async def _send(client: httpx.AsyncClient, *, to: str, subject: str, html: str, text: str, reply_to: str, key: str) -> EmailResult:
    settings = get_settings()
    payload = {
        "from": settings.notification_from_email,
        "to": [to],
        "subject": subject,
        "html": html,
        "text": text,
        "reply_to": reply_to,
    }
    try:
        response = await client.post(
            RESEND_URL,
            json=payload,
            headers={"Authorization": f"Bearer {settings.resend_api_key}", "Idempotency-Key": key[:256]},
        )
    except httpx.HTTPError as exc:
        log.warning("Resend request to %s failed: %s", to, exc)
        return EmailResult(to, False, "network error")
    if response.status_code >= 400:
        try:
            detail = response.json().get("message", "")
        except ValueError:
            detail = response.text[:200]
        log.warning("Resend rejected email to %s (%s): %s", to, response.status_code, detail)
        return EmailResult(to, False, detail)
    return EmailResult(to, True)


async def send_inquiry_emails(item: dict) -> tuple[str, list[EmailResult]]:
    """Send the team alert(s) and customer confirmation. Returns (email_status, results)."""
    settings = get_settings()
    if not settings.resend_api_key:
        return "disabled", []

    team_subject, team_html, team_text = team_alert(item)
    jobs: list[dict] = [
        dict(to=r, subject=team_subject, html=team_html, text=team_text, reply_to=item["email"], key=f"{item['id']}-team-{r}")
        for r in settings.notification_recipients
    ]
    if settings.send_customer_confirmation:
        c_subject, c_html, c_text = customer_confirmation(item)
        jobs.append(
            dict(to=item["email"], subject=c_subject, html=c_html, text=c_text, reply_to=settings.reply_to_email, key=f"{item['id']}-customer")
        )

    async with httpx.AsyncClient(timeout=10) as client:
        results = list(await asyncio.gather(*(_send(client, **job) for job in jobs)))

    team_results = results[: len(settings.notification_recipients)]
    if results and all(r.ok for r in results):
        status = "sent"
    elif any(r.ok for r in team_results):
        status = "partial"
    else:
        status = "failed"
    return status, results

"""FastAPI application factory."""
from __future__ import annotations

import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from . import __version__
from .config import get_settings
from .db import DatabaseUnavailable
from .routes_admin import router as admin_router
from .routes_public import router as public_router
from .security import CSRF_HEADER

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")

FIELD_NAMES = {
    "full_name": "Name",
    "email": "Email",
    "phone": "Phone",
    "company": "Company",
    "service": "Payment enquiry",
    "currency": "Currency",
    "amount": "Amount",
    "contact_method": "Reply method",
    "message": "Message",
    "consent": "Consent",
    "password": "Password",
    "new_password": "New password",
    "current_password": "Current password",
}


def _friendly(field: str, err: dict) -> str:
    kind = err.get("type", "")
    ctx = err.get("ctx") or {}
    if field == "email" and kind in ("value_error", "string_type"):
        return "Enter a valid email address"
    if kind == "string_too_short":
        return f"Please enter at least {ctx.get('min_length')} characters"
    if kind == "string_too_long":
        return f"Please keep this under {ctx.get('max_length')} characters"
    if kind == "missing":
        return "This field is required"
    if kind == "literal_error":
        return "Please choose one of the available options"
    if kind in ("greater_than", "less_than_equal", "float_parsing"):
        return "Enter a valid positive amount"
    if kind == "extra_forbidden":
        return "Unexpected field"
    return str(err.get("msg", "Invalid value")).removeprefix("Value error, ")


def create_app() -> FastAPI:
    settings = get_settings()
    docs = not settings.is_production
    app = FastAPI(
        title="JKJ Exchange Services API",
        version=__version__,
        docs_url="/api/docs" if docs else None,
        redoc_url=None,
        openapi_url="/api/openapi.json" if docs else None,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", CSRF_HEADER],
        max_age=600,
    )

    @app.middleware("http")
    async def security_headers(request: Request, call_next):
        response = await call_next(request)
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
        response.headers.setdefault("X-Frame-Options", "DENY")
        if request.url.path.startswith("/api/v1/admin"):
            response.headers["Cache-Control"] = "no-store"
            response.headers["X-Robots-Tag"] = "noindex"
        return response

    @app.exception_handler(DatabaseUnavailable)
    async def database_unavailable(_: Request, __: DatabaseUnavailable):
        return JSONResponse(
            status_code=503,
            content={"detail": "Our enquiry system is temporarily unavailable. Please contact us on WhatsApp or by phone."},
        )

    @app.exception_handler(RequestValidationError)
    async def validation_error(_: Request, exc: RequestValidationError):
        fields: dict[str, str] = {}
        for err in exc.errors():
            loc = [str(p) for p in err.get("loc", ()) if p not in ("body", "query", "path")]
            name = loc[-1] if loc else "request"
            message = _friendly(name, err)
            fields.setdefault(name, message)
        first_field, first_message = next(iter(fields.items()), ("request", "Invalid request"))
        label = FIELD_NAMES.get(first_field, first_field.replace("_", " ").capitalize())
        return JSONResponse(status_code=422, content={"detail": f"{label}: {first_message}", "errors": fields})

    app.include_router(public_router)
    app.include_router(admin_router)

    @app.get("/", include_in_schema=False)
    async def root():
        return {"service": "JKJ Exchange Services API", "version": __version__, "health": "/api/v1/health"}

    return app


app = create_app()

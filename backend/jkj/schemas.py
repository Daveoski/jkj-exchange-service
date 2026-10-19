"""Request and response models."""
from __future__ import annotations

import re
from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

Service = Literal["rmb", "usd", "alipay", "wechat", "bank", "other"]
Currency = Literal["CNY", "USD", "NGN", "OTHER"]
ContactMethod = Literal["WhatsApp", "Email", "Phone call"]
Status = Literal["new", "contacted", "in_progress", "completed", "closed"]

SERVICE_LABELS: dict[str, str] = {
    "rmb": "RMB supplier payment",
    "usd": "USD supplier payment",
    "alipay": "Alipay",
    "wechat": "WeChat Pay",
    "bank": "Bank transfer",
    "other": "Other enquiry",
}
STATUS_LABELS: dict[str, str] = {
    "new": "New",
    "contacted": "Contacted",
    "in_progress": "In progress",
    "completed": "Completed",
    "closed": "Closed",
}

_CONTROL_CHARS = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")


def _clean(value: str) -> str:
    return _CONTROL_CHARS.sub("", value).strip()


class InquiryIn(BaseModel):
    model_config = ConfigDict(extra="forbid", str_max_length=3000)

    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    phone: str = Field(min_length=7, max_length=30)
    company: str = Field(default="", max_length=160)
    service: Service
    currency: Currency
    amount: float | None = Field(default=None, gt=0, le=999_999_999_999)
    contact_method: ContactMethod
    message: str = Field(min_length=10, max_length=3000)
    consent: bool
    website: str = Field(default="", max_length=200)  # honeypot: humans never see this field
    turnstile_token: str = Field(default="", max_length=2500)

    @field_validator("full_name", "message", "company")
    @classmethod
    def _strip(cls, value: str) -> str:
        return _clean(value)

    @field_validator("full_name")
    @classmethod
    def _name(cls, value: str) -> str:
        if len(value) < 2:
            raise ValueError("Please enter your full name")
        return re.sub(r"\s+", " ", value)

    @field_validator("message")
    @classmethod
    def _message(cls, value: str) -> str:
        if len(value) < 10:
            raise ValueError("Please tell us a little more (at least 10 characters)")
        return value

    @field_validator("phone")
    @classmethod
    def _phone(cls, value: str) -> str:
        value = value.strip()
        if not re.fullmatch(r"[+()\d\s.-]+", value) or len(re.sub(r"\D", "", value)) < 7:
            raise ValueError("Enter a valid phone number")
        return value

    @field_validator("email")
    @classmethod
    def _email(cls, value: str) -> str:
        return value.lower()


class InquiryCreated(BaseModel):
    reference: str
    message: str


class InquiryOut(BaseModel):
    id: UUID
    reference: str
    created_at: datetime
    updated_at: datetime
    full_name: str
    email: str
    phone: str
    company: str
    service: str
    currency: str
    amount: float | None
    contact_method: str
    message: str
    status: str
    admin_notes: str
    email_status: str


class InquiryEventOut(BaseModel):
    id: UUID
    created_at: datetime
    actor: str
    kind: str
    detail: str


class InquiryDetail(InquiryOut):
    events: list[InquiryEventOut]


class InquiryPage(BaseModel):
    items: list[InquiryOut]
    total: int
    limit: int
    offset: int


class InquiryUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    status: Status | None = None
    admin_notes: str | None = Field(default=None, max_length=4000)


class LoginIn(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: EmailStr
    password: str = Field(min_length=1, max_length=256)


class PasswordChangeIn(BaseModel):
    model_config = ConfigDict(extra="forbid")

    current_password: str = Field(min_length=1, max_length=256)
    new_password: str = Field(min_length=10, max_length=256)

    @field_validator("new_password")
    @classmethod
    def _strength(cls, value: str) -> str:
        classes = sum(bool(re.search(p, value)) for p in (r"[a-z]", r"[A-Z]", r"\d", r"[^A-Za-z0-9]"))
        if classes < 3:
            raise ValueError("Use at least three of: lowercase, uppercase, numbers, symbols")
        return value


class AdminOut(BaseModel):
    id: UUID
    email: str
    last_login_at: datetime | None = None


class RateBoardIn(BaseModel):
    model_config = ConfigDict(extra="forbid")

    is_published: bool
    cny_ngn: float | None = Field(default=None, gt=0, le=1_000_000)
    usd_ngn: float | None = Field(default=None, gt=0, le=1_000_000)
    note: str = Field(default="", max_length=240)

    @field_validator("note")
    @classmethod
    def _note(cls, value: str) -> str:
        return _clean(value)


class DailyCount(BaseModel):
    date: str
    count: int


class Stats(BaseModel):
    total: int
    by_status: dict[str, int]
    by_service: dict[str, int]
    last_7_days: int
    last_30_days: int
    daily: list[DailyCount]

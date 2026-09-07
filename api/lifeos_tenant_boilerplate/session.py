from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from itsdangerous import BadSignature, URLSafeTimedSerializer

from .config import get_settings

COOKIE_NAME = "lifeaid_session"
SESSION_MAX_AGE_SECONDS = 8 * 60 * 60
REMEMBERED_SESSION_MAX_AGE_SECONDS = 14 * 24 * 60 * 60


def session_serializer() -> URLSafeTimedSerializer:
    return URLSafeTimedSerializer(get_settings().session_secret, salt="lifeos-tenant-session")


def sign_session(payload: dict[str, Any]) -> str:
    return session_serializer().dumps(payload)


def read_session(value: str | None) -> dict[str, Any] | None:
    if not value:
        return None
    try:
        session = session_serializer().loads(value, max_age=REMEMBERED_SESSION_MAX_AGE_SECONDS)
    except BadSignature:
        return None
    expires_at = parse_time(session.get("expiresAt"))
    if expires_at and expires_at <= datetime.now(timezone.utc):
        return None
    return session


def public_session(payload: dict[str, Any] | None) -> dict[str, Any]:
    if not payload:
        return {"authenticated": False, "user": None, "tenant": None, "issuedAt": None, "expiresAt": None}
    return {
        "authenticated": True,
        "user": payload.get("user"),
        "tenant": payload.get("tenant"),
        "auth": payload.get("auth"),
        "issuedAt": payload.get("issuedAt"),
        "expiresAt": payload.get("expiresAt"),
    }


def build_session(claims: dict[str, Any], ttl_seconds: int = SESSION_MAX_AGE_SECONDS) -> dict[str, Any]:
    now = datetime.now(timezone.utc)
    expires = now + timedelta(seconds=ttl_seconds)
    email = str(claims.get("email") or claims.get("nameId") or "user@lifeos.local")
    name = str(claims.get("name") or email.split("@")[0].replace(".", " ").title())
    return {
        "user": {
            "id": str(claims.get("id") or claims.get("nameId") or email),
            "name": name,
            "email": email,
            "initials": initials(name),
            "roles": list_value(claims.get("roles")),
            "appEntitlements": list_value(claims.get("app_entitlements") or claims.get("appEntitlements")),
        },
        "tenant": {
            "id": str(claims.get("tenant_id") or claims.get("tenantId") or get_settings().lifeos_tenant_id),
            "name": str(claims.get("tenantName") or claims.get("tenant_name") or get_settings().brand_organization),
            "appId": str(claims.get("app_id") or claims.get("appId") or get_settings().lifeos_app_id),
        },
        "auth": {
            "provider": str(claims.get("authProvider") or "lifeos_saml"),
        },
        "issuedAt": now.isoformat(),
        "expiresAt": expires.isoformat(),
    }


def initials(name: str) -> str:
    parts = [part for part in name.replace("@", " ").replace(".", " ").split() if part]
    return "".join(part[0].upper() for part in parts[:2]) or "LO"


def list_value(value: Any) -> list[str]:
    if isinstance(value, list):
        return [str(item) for item in value]
    if isinstance(value, tuple):
        return [str(item) for item in value]
    if isinstance(value, str):
        return [item.strip() for item in value.split(",") if item.strip()]
    return []


def parse_time(value: Any) -> datetime | None:
    if not isinstance(value, str) or not value:
        return None
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None
    return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)

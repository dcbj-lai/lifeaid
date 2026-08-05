from __future__ import annotations

import hmac
from pathlib import Path
from typing import Any
from urllib.parse import quote

from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from .config import get_settings
from .saml import build_authn_redirect_url, build_sp_metadata, parse_and_validate_response
from .session import (
    COOKIE_NAME,
    REMEMBERED_SESSION_MAX_AGE_SECONDS,
    SESSION_MAX_AGE_SECONDS,
    build_session,
    public_session,
    read_session,
    sign_session,
)

ROOT = Path(__file__).resolve().parents[2]
DIST_DIR = ROOT / "dist"
DOCS_DIR = ROOT / "docs"

app = FastAPI(title="LifeOS Tenant Boilerplate API", version="0.1.0")
settings = get_settings()


class LoginPayload(BaseModel):
    email: str
    password: str
    remember: bool = True


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_origin,
        "http://127.0.0.1:5175",
        "http://localhost:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/healthz")
def healthz() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/branding")
def branding() -> dict[str, Any]:
    return {
        "appName": settings.app_name,
        "brandName": settings.brand_name,
        "organization": settings.brand_organization,
        "accent": settings.brand_accent,
        "lifeosUrl": settings.lifeos_url,
        "tenantId": settings.lifeos_tenant_id,
        "appId": settings.lifeos_app_id,
        "spEntityId": settings.saml_sp_entity_id,
        "acsUrl": settings.acs_url,
        "sloUrl": settings.slo_url,
        "idpMetadataUrl": settings.idp_metadata_url,
    }


@app.get("/api/auth/session")
def auth_session(request: Request) -> dict[str, Any]:
    return public_session(read_session(request.cookies.get(COOKIE_NAME)))


@app.post("/api/auth/login")
def password_login(payload: LoginPayload, response: Response) -> dict[str, Any]:
    if payload.email.strip().lower() != settings.app_auth_email.strip().lower():
        raise HTTPException(status_code=422, detail="Invalid email or password.")
    if not hmac.compare_digest(payload.password, settings.app_auth_password):
        raise HTTPException(status_code=422, detail="Invalid email or password.")

    session = build_session(
        {
            "id": f"app_user_{settings.app_auth_email.strip().lower()}",
            "name": settings.app_auth_name,
            "email": settings.app_auth_email.strip().lower(),
            "tenant_id": settings.lifeos_tenant_id,
            "tenantName": settings.brand_organization,
            "app_id": settings.lifeos_app_id,
            "roles": settings.app_auth_roles,
            "app_entitlements": [settings.lifeos_app_id],
            "authProvider": "password",
        },
        ttl_seconds=REMEMBERED_SESSION_MAX_AGE_SECONDS if payload.remember else SESSION_MAX_AGE_SECONDS,
    )
    set_session_cookie(response, session)
    return public_session(session)


@app.post("/api/auth/dev-login")
def dev_login(response: Response) -> dict[str, Any]:
    if settings.app_env != "local":
        raise HTTPException(status_code=404, detail="Local development login is disabled.")
    session = build_session(
        {
            "id": "lifeos_user_dev",
            "name": "LifeOS Developer",
            "email": "developer@lifeos.local",
            "tenant_id": settings.lifeos_tenant_id,
            "tenantName": settings.brand_organization,
            "app_id": settings.lifeos_app_id,
            "roles": ["tenant-admin"],
            "app_entitlements": [settings.lifeos_app_id],
            "authProvider": "local_dev",
        }
    )
    set_session_cookie(response, session)
    return public_session(session)


@app.post("/api/auth/logout")
def logout(response: Response) -> dict[str, str]:
    response.delete_cookie(COOKIE_NAME)
    return {"message": "Signed out"}


@app.get("/api/navigation")
def navigation(request: Request) -> dict[str, Any]:
    require_app_session(request)
    return {
        "navigation": [
            {
                "label": "Workspace",
                "items": [
                    {"label": "Dashboard", "path": "/dashboard", "icon": "LayoutDashboard"},
                    {"label": "Records", "path": "/records", "icon": "Database"},
                    {"label": "Workflow", "path": "/workflow", "icon": "Workflow"},
                ],
            },
            {
                "label": "Tenant",
                "items": [
                    {"label": "People", "path": "/people", "icon": "Users"},
                    {"label": "Reports", "path": "/reports", "icon": "ChartColumnIncreasing"},
                    {"label": "Settings", "path": "/settings", "icon": "Settings"},
                ],
            },
        ]
    }


@app.get("/api/dashboard")
def dashboard(request: Request) -> dict[str, Any]:
    session = require_app_session(request)
    auth_provider = session.get("auth", {}).get("provider")
    auth_label = {
        "lifeos_saml": "LifeOS SAML",
        "password": "password",
        "local_dev": "local development",
    }.get(auth_provider, "tenant")
    return {
        "summary": [
            {"label": "Open items", "value": "24", "detail": "Replace with tenant workflow data"},
            {"label": "Tasks due", "value": "8", "detail": "Connect to your app domain model"},
            {"label": "Active users", "value": "12", "detail": "Scoped by LifeOS tenant membership"},
        ],
        "activity": [
            {"title": f"{auth_label} session established", "detail": session["user"]["email"]},
            {"title": "Tenant placeholder loaded", "detail": session["tenant"]["name"]},
            {"title": "Navigation ready", "detail": "Swap these routes for your product areas"},
        ],
    }


@app.get("/saml/metadata")
def saml_metadata() -> Response:
    return Response(build_sp_metadata(settings), media_type="application/samlmetadata+xml")


@app.get("/api/auth/saml/login")
def saml_login(relay_state: str = "/dashboard", RelayState: str = "") -> RedirectResponse:
    target = RelayState or relay_state or "/dashboard"
    return RedirectResponse(build_authn_redirect_url(settings, target))


@app.post("/saml/acs")
async def saml_acs(request: Request) -> Response:
    form = await request.form()
    relay_state = str(form.get("RelayState") or "/dashboard")
    try:
        claims = parse_and_validate_response(str(form.get("SAMLResponse") or ""), settings)
    except Exception as error:
        raise HTTPException(status_code=401, detail=f"SAML sign-in failed: {error}") from error

    session = build_session(claims)
    redirect = RedirectResponse(safe_frontend_redirect(relay_state), status_code=303)
    set_session_cookie(redirect, session)
    return redirect


@app.api_route("/saml/slo", methods=["GET", "POST"])
async def saml_slo(response: Response) -> RedirectResponse:
    del response
    redirect = RedirectResponse(f"{settings.lifeos_url}/login?lifeos_logout=1")
    redirect.delete_cookie(COOKIE_NAME)
    return redirect


def require_app_session(request: Request) -> dict[str, Any]:
    session = read_session(request.cookies.get(COOKIE_NAME))
    if not session:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return session


def set_session_cookie(response: Response, session: dict[str, Any]) -> None:
    response.set_cookie(
        COOKIE_NAME,
        sign_session(session),
        httponly=True,
        secure=settings.app_env != "local",
        samesite="lax",
        max_age=REMEMBERED_SESSION_MAX_AGE_SECONDS,
    )


def safe_frontend_redirect(path_or_url: str) -> str:
    if not path_or_url:
        return f"{settings.frontend_origin}/dashboard"
    if path_or_url.startswith("/") and not path_or_url.startswith("//"):
        return f"{settings.frontend_origin}{path_or_url}"
    return f"{settings.frontend_origin}/dashboard?blocked_redirect={quote(path_or_url, safe='')}"


if DOCS_DIR.exists():
    app.mount("/docs", StaticFiles(directory=DOCS_DIR), name="docs")


if (DIST_DIR / "assets").exists():
    app.mount("/assets", StaticFiles(directory=DIST_DIR / "assets"), name="frontend-assets")


@app.get("/{path:path}")
def frontend(path: str) -> Response:
    del path
    index = DIST_DIR / "index.html"
    if index.exists():
        return FileResponse(index)
    return JSONResponse({"message": "LifeOS Tenant Boilerplate API is running. Start Vite or build the frontend."})

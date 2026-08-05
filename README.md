# LifeOS Tenant Boilerplate

Clone-ready starter for a LifeOS tenant application. It uses the same broad stack as LifeOS: React/Vite on the frontend and Python/FastAPI on the backend.

## What Is Included

- LifeOS-styled tenant shell with sidebar navigation, topbar actions, user chip, dark mode, and placeholder modules.
- Normal password authentication for the tenant app.
- Optional LifeOS SSO sign-in alongside password authentication.
- SAML Service Provider endpoints: `/saml/metadata`, `/saml/acs`, and `/saml/slo`.
- Signed app session cookie created after password or LifeOS SAML authentication.
- Local development sign-in for `APP_ENV=local`.
- Dockerfile and `docker-compose.yml` for quick clone and local deploy.

## Quick Start

```bash
cp .env.example .env
pnpm install
pnpm dev
```

In another terminal:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pnpm api
```

Open `http://127.0.0.1:5175`.

Default local password login:

```text
admin@tenant.local / password
```

## Docker

```bash
cp .env.example .env
docker compose up --build
```

Open `http://127.0.0.1:8002`.

## LifeOS Registration

See [docs/LIFEOS_SAML_SETUP.md](/Users/donbalbieran/Documents/lifeos-tenant-boilerplate/docs/LIFEOS_SAML_SETUP.md).

At minimum, configure this app in LifeOS with:

```text
Launch URL: http://127.0.0.1:8002
SP Entity ID: urn:lifeos:tenant-boilerplate:sp
ACS URL: http://127.0.0.1:8002/saml/acs
SLO URL: http://127.0.0.1:8002/saml/slo
```

Then set `LIFEOS_IDP_CERTIFICATE` for environments where signed SAML validation must be enforced.

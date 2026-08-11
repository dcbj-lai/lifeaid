# LifeOS Tenant Boilerplate

Clone-ready starter for a LifeOS tenant application. It uses the same broad stack as LifeOS: React/Vite on the frontend and Python/FastAPI on the backend.

LifeOS owns suite authentication, tenant membership, app entitlements, and app launcher visibility. A tenant app owns its own session, product roles, permissions, and data after LifeOS admits the user through SAML.

## What Is Included

- LifeOS-styled tenant shell with sidebar navigation, topbar actions, user chip, dark mode, and placeholder modules.
- Normal password authentication for the tenant app.
- Optional LifeOS SSO sign-in alongside password authentication.
- In-app SAML setup view at `/saml-setup` with SP, IdP, claim, and rehearsal details.
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

Use one host consistently during local SAML testing. If LifeOS is opened at `127.0.0.1`, keep this app on `127.0.0.1`; do not switch part of the flow to `localhost`.

## LifeOS Registration

See [docs/LIFEOS_SAML_SETUP.md](docs/LIFEOS_SAML_SETUP.md).

After signing in, open `SAML Setup` in the tenant navigation to view the same registration values inside the app shell.

At minimum, configure this app in LifeOS with:

```text
Tenant ID: tenant-boilerplate
App ID: tenant-boilerplate
Launch URL: http://127.0.0.1:8002
Required entitlement: tenant-boilerplate
SP Entity ID: urn:lifeos:tenant-boilerplate:sp
ACS URL: http://127.0.0.1:8002/saml/acs
SLO URL: http://127.0.0.1:8002/saml/slo
NameID format: urn:oasis:names:tc:SAML:2.0:nameid-format:persistent
```

Then set `LIFEOS_IDP_CERTIFICATE` from LifeOS IdP metadata for environments where signed SAML validation must be enforced.

## App Developer Checklist

When adapting this boilerplate for a real LifeOS product:

1. Replace `tenant-boilerplate` IDs, display names, ports, and branding in `.env`, `docker-compose.yml`, and UI copy.
2. Keep `people_id` as the durable cross-app identity key. Do not rely on email alone.
3. Keep app-local roles and permissions inside the product app. LifeOS entitlements are only the suite admission gate.
4. Register the app in LifeOS Settings and copy the generated IdP metadata/certificate into the app environment.
5. Smoke-test IdP-initiated SSO from LifeOS and SP-initiated SSO from the app login screen.
6. Confirm app logout clears the app session and sends LifeOS SSO users back through the LifeOS logout/SLO sequence.
7. For staging and production, use environment-specific public URLs and entity IDs. Do not hardcode local ports into source.

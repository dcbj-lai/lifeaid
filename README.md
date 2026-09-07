# LifeAid — Life College Financial Aid

LifeAid starts from the [LifeOS tenant boilerplate](https://github.com/dcbj-lai/lifeos-tenant-boilerplate) at commit `08d0069e24bd1fb1454595ee7f6c9171fa883cb4`. The financial-aid and Student Work Program frontend now includes interactive React workflows with hardcoded sample data, including degree-linked scholarship cartridges, awards, and renewals. Business backend implementation is deferred. See [Frontend preview](docs/FRONTEND_PREVIEW.md) for architecture and walkthrough. It uses the same broad stack as LifeOS: React/Vite on the frontend and Python/FastAPI on the backend.

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

Open `http://127.0.0.1:5175`. For this Vite workflow, set `FRONTEND_URL=http://127.0.0.1:5175` in `.env`.

Default local password login:

```text
admin@lifeaid.local / password
```

## Docker

```bash
cp .env.example .env
docker compose up -d --build
```

Open `http://127.0.0.1:8002`. Docker serves both the React build and FastAPI on this address.

After copying `.env.example`, replace `SESSION_SECRET` with a unique random value. The initial local setup already has a generated secret in the ignored `.env` file. The documented password is for local development.

```bash
docker compose ps
docker compose logs --tail=100 app
docker compose stop
```

The Docker project is `lifeaid`, and its session cookie is `lifeaid_session` to avoid collisions with other tenant apps on the same host. Compose passes all `.env` settings, including branding, session secret, and SAML certificate, to the container.

`life-college` is a provisional tenant ID; confirm the existing Life College tenant ID before registering LifeAid. The LifeOS URL is still the boilerplate default (`http://127.0.0.1:5174`). SSO registration and end-to-end integration have not been completed.

Use one host consistently during local SAML testing. If LifeOS is opened at `127.0.0.1`, keep this app on `127.0.0.1`; do not switch part of the flow to `localhost`.

## AWS Persistence

The boilerplate starts as a mostly stateless tenant app: authentication creates a signed app session cookie, and the placeholder modules do not require a database.

When a real tenant product needs persistence, follow the LifeOS deployment pattern:

- Use PostgreSQL for local development, usually through Docker Compose.
- Use Amazon RDS for PostgreSQL on AWS.
- Store the production `DATABASE_URL` in AWS Secrets Manager or SSM Parameter Store.
- Inject `DATABASE_URL` into the ECS task definition as a secret.
- Keep tenant product data inside the tenant app database. LifeOS remains the suite gate for tenant membership, app access, and SAML.

Example SQLAlchemy URL shape:

```text
DATABASE_URL=postgresql+psycopg://USER:PASSWORD@RDS_ENDPOINT:5432/tenant_app
```

## LifeOS Registration

See [docs/LIFEOS_SAML_SETUP.md](docs/LIFEOS_SAML_SETUP.md).

After signing in, open `SAML Setup` in the tenant navigation to view the same registration values inside the app shell.

At minimum, configure this app in LifeOS with:

```text
Tenant ID: life-college
App ID: lifeaid
Launch URL: http://127.0.0.1:8002
Required entitlement: lifeaid
SP Entity ID: urn:lifeos:lifeaid:sp
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
8. If the app stores product data, add PostgreSQL locally and use RDS PostgreSQL on AWS with `DATABASE_URL` injected from Secrets Manager or SSM.

## LifeAid palette

The interface uses Life College Khaki (`#CC9A71`) and Sand (`#E2CFB3`) from page 22 of the supplied 2026 brand guide, supported by Life Ivory (`#F2E8DC`), white, and dark neutral text. Dark mode uses warm neutral surfaces and sand text accents. Primary buttons use Life Crimson (`#9E1D20`) with Life Maroon (`#690F0D`) hover states. Existing logo artwork retains its original colors. Crimson Pro remains the heading typeface.

## Shared GitHub Pages mockup

The `Deploy LifeAid mockup` workflow builds and deploys `main` to GitHub Pages. Enable Pages with GitHub Actions as the publishing source. The preview URL is https://dcbj-lai.github.io/lifeaid/.

`pnpm build:pages` creates a static preview at the `/lifeaid/` base path, bypasses server sign-in, and hides SAML setup. Demo user switching and Reset demo operate only on fictional in-memory records. Every browser has an independent session; refreshing discards changes. GitHub Pages does not enforce LifeAid authentication or backend RBAC. The Docker build retains the original authentication flow.

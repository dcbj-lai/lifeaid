# LifeOS SAML Setup

This boilerplate is a LifeOS SAML Service Provider.

The tenant app also includes a matching `SAML Setup` navigation view at `/saml-setup` after sign-in.

## App Endpoints

- SP metadata: `GET /saml/metadata`
- Assertion consumer service: `POST /saml/acs`
- Single logout: `GET|POST /saml/slo`
- App session: `GET /api/auth/session`
- Password login: `POST /api/auth/login`

LifeOS SSO is optional and should sit alongside the app's own password authentication path. LifeOS grants suite access and app entitlement; the app still owns product RBAC.

## Local URLs

Use one browser host consistently during local testing. If LifeOS is opened on `127.0.0.1`, keep the app on `127.0.0.1`; do not mix `localhost` into the same session flow.

```text
LifeOS: http://127.0.0.1:5174
Tenant app Docker: http://127.0.0.1:8002
Tenant app Vite: http://127.0.0.1:5175
```

## Register In LifeOS

First confirm the existing Life College tenant ID and LifeOS URL. `life-college` below is provisional. Add LifeAid to the existing tenant if one is already registered; do not create a duplicate college tenant. For a new tenant, sign in as a suite admin and open:

```text
Settings -> Register Tenant
```

For the boilerplate, use:

```text
Tenant ID: life-college
Tenant Name: Life College
Organization Name: Life College
First App ID: lifeaid
First App Name: LifeAid
Launch URL: http://127.0.0.1:8002
Required Entitlement: lifeaid
```

Then open:

```text
Settings -> SAML Apps -> LifeAid
```

Configure:

```text
Enabled: yes
SP Entity ID: urn:lifeos:lifeaid:sp
Audience: urn:lifeos:lifeaid:sp
ACS URL: http://127.0.0.1:8002/saml/acs
SLO URL: http://127.0.0.1:8002/saml/slo
NameID format: urn:oasis:names:tc:SAML:2.0:nameid-format:persistent
IdP-initiated SSO: enabled for local smoke tests
```

If the app signs requests, import the SP metadata XML or paste the SP certificate in LifeOS.

Default attribute mappings:

```json
[
  { "name": "people_id", "claim": "peopleId" },
  { "name": "email", "claim": "email" },
  { "name": "name", "claim": "name" },
  { "name": "tenant_id", "claim": "tenantId" },
  { "name": "app_id", "claim": "appId" },
  { "name": "roles", "claim": "roles" },
  { "name": "app_entitlements", "claim": "appEntitlements" }
]
```

## App Environment

Set these values for local Docker:

```text
APP_PUBLIC_URL=http://127.0.0.1:8002
FRONTEND_URL=http://127.0.0.1:8002
LIFEOS_PUBLIC_URL=http://127.0.0.1:5174
LIFEOS_TENANT_ID=life-college
LIFEOS_APP_ID=lifeaid
LIFEOS_IDP_ENTITY_ID=http://127.0.0.1:5174/saml/idp/life-college
SAML_SP_ENTITY_ID=urn:lifeos:lifeaid:sp
SAML_REQUIRE_SIGNED_RESPONSE=true
```

For non-local environments, set `LIFEOS_IDP_CERTIFICATE` from LifeOS IdP metadata and keep `SAML_REQUIRE_SIGNED_RESPONSE=true`.

## Validation Rules For Real Apps

The ACS endpoint should:

1. Verify the LifeOS IdP XML signature.
2. Require the expected LifeOS issuer.
3. Require the configured SP audience.
4. Require recipient and destination to match this app's ACS URL.
5. Enforce `NotBefore` and `NotOnOrAfter` with small clock skew.
6. Reject replayed response or assertion IDs.
7. Require the expected `tenant_id` and `app_id`.
8. Require the app entitlement in `app_entitlements`.
9. Map `people_id` to the durable app person/user record.
10. Create the app-local session and apply app-local RBAC.

Logout should clear the app session. If the current session came from LifeOS SSO, app logout should send the browser back through LifeOS logout/SLO rather than only showing the app-local login screen.

## Smoke Test

1. Start LifeOS.
2. Start this app.
3. Register the tenant/app in LifeOS.
4. Copy the LifeOS IdP certificate into `LIFEOS_IDP_CERTIFICATE` when signature enforcement is enabled.
5. Open the IdP-initiated URL:

   ```text
   http://127.0.0.1:5174/saml/sso?tenant_id=life-college&app_id=lifeaid
   ```

6. Confirm the browser lands inside the tenant app with a LifeOS-backed app session.
7. Log out from the tenant app and confirm the browser returns to the LifeOS login/logout sequence.

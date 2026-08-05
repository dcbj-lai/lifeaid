# LifeOS SAML Setup

This boilerplate is a LifeOS SAML Service Provider.

## App Endpoints

- SP metadata: `GET /saml/metadata`
- Assertion consumer service: `POST /saml/acs`
- Single logout: `GET|POST /saml/slo`
- App session: `GET /api/auth/session`

## Register In LifeOS

In LifeOS, register the tenant app with these values:

```text
SP Entity ID: urn:lifeos:tenant-boilerplate:sp
ACS URL: http://127.0.0.1:8002/saml/acs
SLO URL: http://127.0.0.1:8002/saml/slo
NameID format: urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress
```

Default attribute mappings:

```json
[
  { "name": "email", "claim": "email" },
  { "name": "name", "claim": "name" },
  { "name": "tenant_id", "claim": "tenantId" },
  { "name": "app_id", "claim": "appId" },
  { "name": "roles", "claim": "roles" },
  { "name": "app_entitlements", "claim": "appEntitlements" }
]
```

For non-local environments, set `LIFEOS_IDP_CERTIFICATE` from LifeOS IdP metadata and keep `SAML_REQUIRE_SIGNED_RESPONSE=true`.


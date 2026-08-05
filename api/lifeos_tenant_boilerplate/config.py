from functools import lru_cache
from urllib.parse import urljoin

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_env: str = "local"
    app_name: str = "Tenant Boilerplate"
    app_public_url: str = "http://127.0.0.1:8002"
    frontend_url: str = ""
    session_secret: str = "lifeos-tenant-boilerplate-local-secret"

    lifeos_public_url: str = "http://127.0.0.1:5174"
    lifeos_tenant_id: str = "tenant-boilerplate"
    lifeos_app_id: str = "tenant-boilerplate"
    lifeos_idp_entity_id: str = ""
    lifeos_idp_certificate: str = ""

    saml_sp_entity_id: str = "urn:lifeos:tenant-boilerplate:sp"
    saml_require_signed_response: bool = True
    saml_clock_skew_seconds: int = 120

    app_auth_email: str = "admin@tenant.local"
    app_auth_password: str = "password"
    app_auth_name: str = "Tenant Admin"
    app_auth_roles: str = "tenant-admin"

    brand_name: str = "Tenant App"
    brand_organization: str = "LifeOS Tenant"
    brand_accent: str = "#9e1d20"

    @property
    def public_url(self) -> str:
        return self.app_public_url.rstrip("/")

    @property
    def frontend_origin(self) -> str:
        return (self.frontend_url or self.public_url).rstrip("/")

    @property
    def lifeos_url(self) -> str:
        return self.lifeos_public_url.rstrip("/")

    @property
    def idp_entity_id(self) -> str:
        return self.lifeos_idp_entity_id or f"{self.lifeos_url}/saml/idp/{self.lifeos_tenant_id}"

    @property
    def idp_metadata_url(self) -> str:
        return f"{self.lifeos_url}/saml/idp/metadata?tenant_id={self.lifeos_tenant_id}"

    @property
    def idp_sso_url(self) -> str:
        return urljoin(f"{self.lifeos_url}/", "saml/sso")

    @property
    def idp_slo_url(self) -> str:
        return urljoin(f"{self.lifeos_url}/", "saml/slo")

    @property
    def acs_url(self) -> str:
        return f"{self.public_url}/saml/acs"

    @property
    def slo_url(self) -> str:
        return f"{self.public_url}/saml/slo"


@lru_cache
def get_settings() -> Settings:
    return Settings()

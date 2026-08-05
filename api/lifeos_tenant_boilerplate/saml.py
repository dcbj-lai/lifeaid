from __future__ import annotations

import base64
import secrets
import uuid
import zlib
from datetime import datetime, timedelta, timezone
from typing import Any
from urllib.parse import urlencode

from lxml import etree
from signxml import XMLVerifier

from .config import Settings

SAML_PROTOCOL = "urn:oasis:names:tc:SAML:2.0:protocol"
SAML_ASSERTION = "urn:oasis:names:tc:SAML:2.0:assertion"
SAML_METADATA = "urn:oasis:names:tc:SAML:2.0:metadata"
DSIG = "http://www.w3.org/2000/09/xmldsig#"
EMAIL_NAMEID = "urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress"
POST_BINDING = "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
REDIRECT_BINDING = "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect"

_replay_cache: dict[str, datetime] = {}


def build_sp_metadata(settings: Settings) -> str:
    entity = etree.Element(f"{{{SAML_METADATA}}}EntityDescriptor", nsmap={None: SAML_METADATA})
    entity.set("entityID", settings.saml_sp_entity_id)
    descriptor = etree.SubElement(entity, f"{{{SAML_METADATA}}}SPSSODescriptor")
    descriptor.set("protocolSupportEnumeration", SAML_PROTOCOL)
    descriptor.set("AuthnRequestsSigned", "false")
    descriptor.set("WantAssertionsSigned", "true")

    name_id = etree.SubElement(descriptor, f"{{{SAML_METADATA}}}NameIDFormat")
    name_id.text = EMAIL_NAMEID

    acs = etree.SubElement(descriptor, f"{{{SAML_METADATA}}}AssertionConsumerService")
    acs.set("Binding", POST_BINDING)
    acs.set("Location", settings.acs_url)
    acs.set("index", "0")
    acs.set("isDefault", "true")

    slo = etree.SubElement(descriptor, f"{{{SAML_METADATA}}}SingleLogoutService")
    slo.set("Binding", REDIRECT_BINDING)
    slo.set("Location", settings.slo_url)

    return xml_string(entity)


def build_authn_redirect_url(settings: Settings, relay_state: str = "/") -> str:
    now = datetime.now(timezone.utc).isoformat()
    request_id = f"_{uuid.uuid4().hex}"
    root = etree.Element(
        f"{{{SAML_PROTOCOL}}}AuthnRequest",
        nsmap={"samlp": SAML_PROTOCOL, "saml": SAML_ASSERTION},
        ID=request_id,
        Version="2.0",
        IssueInstant=now,
        Destination=settings.idp_sso_url,
        AssertionConsumerServiceURL=settings.acs_url,
        ProtocolBinding=POST_BINDING,
    )
    etree.SubElement(root, f"{{{SAML_ASSERTION}}}Issuer").text = settings.saml_sp_entity_id
    name_id_policy = etree.SubElement(root, f"{{{SAML_PROTOCOL}}}NameIDPolicy")
    name_id_policy.set("Format", EMAIL_NAMEID)
    name_id_policy.set("AllowCreate", "true")

    xml = etree.tostring(root, encoding="utf-8", xml_declaration=False)
    deflated = zlib.compressobj(wbits=-15)
    encoded = base64.b64encode(deflated.compress(xml) + deflated.flush()).decode("utf-8")
    query = urlencode(
        {
            "tenant_id": settings.lifeos_tenant_id,
            "app_id": settings.lifeos_app_id,
            "SAMLRequest": encoded,
            "RelayState": relay_state or "/",
        }
    )
    return f"{settings.idp_sso_url}?{query}"


def parse_and_validate_response(encoded_response: str, settings: Settings) -> dict[str, Any]:
    if not encoded_response:
        raise ValueError("Missing SAMLResponse.")

    xml = base64.b64decode(encoded_response)
    root = etree.fromstring(xml, parser=etree.XMLParser(resolve_entities=False))

    if settings.lifeos_idp_certificate:
        XMLVerifier().verify(root, x509_cert=settings.lifeos_idp_certificate)
    elif settings.saml_require_signed_response and settings.app_env != "local":
        raise ValueError("SAML signature verification requires LIFEOS_IDP_CERTIFICATE.")

    validate_response(root, settings)
    return extract_claims(root)


def validate_response(root: etree._Element, settings: Settings) -> None:
    now = datetime.now(timezone.utc)
    response_id = root.get("ID")
    assertion = first(root, "Assertion")
    assertion_id = assertion.get("ID") if assertion is not None else None

    for saml_id in [response_id, assertion_id]:
        if saml_id:
            remember_saml_id(saml_id, now)

    status = first(root, "StatusCode")
    if status is not None and status.get("Value") != "urn:oasis:names:tc:SAML:2.0:status:Success":
        raise ValueError("LifeOS returned an unsuccessful SAML status.")

    issuer = text(first(root, "Issuer"))
    if issuer != settings.idp_entity_id:
        raise ValueError("SAML issuer does not match the configured LifeOS IdP.")

    destination = root.get("Destination", "")
    if destination and destination != settings.acs_url:
        raise ValueError("SAML destination does not match this app ACS URL.")

    if assertion is None:
        raise ValueError("SAML assertion is missing.")

    audience = text(first(assertion, "Audience"))
    if audience and audience != settings.saml_sp_entity_id:
        raise ValueError("SAML audience does not match this app SP entity ID.")

    confirmation = first(assertion, "SubjectConfirmationData")
    recipient = confirmation.get("Recipient", "") if confirmation is not None else ""
    if recipient and recipient != settings.acs_url:
        raise ValueError("SAML recipient does not match this app ACS URL.")

    conditions = first(assertion, "Conditions")
    if conditions is not None:
        skew = timedelta(seconds=settings.saml_clock_skew_seconds)
        not_before = parse_time(conditions.get("NotBefore"))
        not_on_or_after = parse_time(conditions.get("NotOnOrAfter"))
        if not_before and now + skew < not_before:
            raise ValueError("SAML assertion is not valid yet.")
        if not_on_or_after and now - skew >= not_on_or_after:
            raise ValueError("SAML assertion has expired.")


def extract_claims(root: etree._Element) -> dict[str, Any]:
    assertion = first(root, "Assertion")
    if assertion is None:
        return {}

    claims: dict[str, Any] = {"nameId": text(first(assertion, "NameID"))}
    for attribute in assertion.xpath(".//*[local-name()='Attribute']"):
        name = attribute.get("Name") or attribute.get("FriendlyName")
        if not name:
            continue
        values = [text(node) for node in attribute.xpath("./*[local-name()='AttributeValue']") if text(node)]
        claims[name] = values if len(values) > 1 else values[0] if values else ""
    return claims


def remember_saml_id(saml_id: str, now: datetime) -> None:
    expired = [key for key, expires_at in _replay_cache.items() if expires_at <= now]
    for key in expired:
        del _replay_cache[key]
    if saml_id in _replay_cache:
        raise ValueError("SAML response replay detected.")
    _replay_cache[saml_id] = now + timedelta(minutes=10)


def parse_time(value: str | None) -> datetime | None:
    if not value:
        return None
    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)


def first(root: etree._Element, local_name: str) -> etree._Element | None:
    nodes = root.xpath(f".//*[local-name()=$name]", name=local_name)
    return nodes[0] if nodes else None


def text(node: etree._Element | None) -> str:
    return node.text.strip() if node is not None and node.text else ""


def xml_string(node: etree._Element) -> str:
    return etree.tostring(node, encoding="utf-8", xml_declaration=True, pretty_print=True).decode("utf-8")


def nonce() -> str:
    return secrets.token_urlsafe(18)

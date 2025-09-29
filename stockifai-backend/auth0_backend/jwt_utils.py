import json
from functools import lru_cache

import requests
from jose import jwt
from django.conf import settings

AUTH0_DOMAIN = settings.AUTH0_DOMAIN
API_IDENTIFIER = settings.AUTH0_AUDIENCE
ALGORITHMS = settings.ALGORITHMS

jwks_url = f"https://{AUTH0_DOMAIN}/.well-known/jwks.json"


@lru_cache(maxsize=1)
def get_jwks():
    response = requests.get(jwks_url, timeout=5)
    response.raise_for_status()
    return response.json()

def decode_jwt(token):
    # Extrae el header del token
    header = jwt.get_unverified_header(token)

    rsa_key = {}
    jwks = get_jwks()
    for key in jwks["keys"]:
        if key["kid"] == header["kid"]:
            rsa_key = {
                "kty": key["kty"],
                "kid": key["kid"],
                "use": key["use"],
                "n": key["n"],
                "e": key["e"]
            }
    if not rsa_key:
        raise Exception("No se encontró la clave adecuada en JWKS")

    # Decodifica el token usando la clave pública
    payload = jwt.decode(
        token,
        rsa_key,
        algorithms=ALGORITHMS,
        audience=API_IDENTIFIER,
        issuer=f"https://{AUTH0_DOMAIN}/"
    )
    return payload

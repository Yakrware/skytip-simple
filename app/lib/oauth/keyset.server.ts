import { Keyset } from "@atproto/jwk";
import { JoseKey } from "@atproto/jwk-jose";

let cached: Promise<Keyset | null> | undefined;

export function getKeyset(jwk: string | undefined): Promise<Keyset | null> {
  if (cached) return cached;
  const raw = jwk?.trim();
  cached = raw
    ? JoseKey.fromJWK(raw).then((key) => new Keyset([key]))
    : Promise.resolve(null);
  return cached;
}

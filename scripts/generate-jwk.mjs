#!/usr/bin/env node
// Generates an ES256 private JWK suitable for OAUTH_PRIVATE_JWK.
import { subtle, randomUUID } from "node:crypto";

export async function generateJwk() {
  const { privateKey } = await subtle.generateKey(
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign", "verify"],
  );
  const jwk = await subtle.exportKey("jwk", privateKey);
  jwk.alg = "ES256";
  jwk.use = "sig";
  jwk.kid = randomUUID();
  return jwk;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.stdout.write(JSON.stringify(await generateJwk()) + "\n");
}

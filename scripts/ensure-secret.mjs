#!/usr/bin/env node
// Ensures OAUTH_PRIVATE_JWK is set as a wrangler secret. No-op if already set.
// Runs during `npm run deploy` so fresh deploys (incl. Cloudflare's one-click
// button) end up with a working confidential-client key without operator action.
import { execFileSync, spawnSync } from "node:child_process";
import { generateJwk } from "./generate-jwk.mjs";

const SECRET = "OAUTH_PRIVATE_JWK";

function listSecrets() {
  try {
    const out = execFileSync(
      "npx",
      ["wrangler", "secret", "list", "--format", "json"],
      {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    return JSON.parse(out).map((s) => s.name);
  } catch (e) {
    console.error(`Failed to list wrangler secrets: ${e.message}`);
    process.exit(1);
  }
}

if (listSecrets().includes(SECRET)) {
  console.log(`${SECRET} already set — skipping.`);
  process.exit(0);
}

console.log(`${SECRET} not set — generating and storing...`);
const jwk = JSON.stringify(await generateJwk());
const res = spawnSync("npx", ["wrangler", "secret", "put", SECRET], {
  input: jwk,
  stdio: ["pipe", "inherit", "inherit"],
});
if (res.status !== 0) process.exit(res.status ?? 1);

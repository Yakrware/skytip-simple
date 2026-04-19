# skytip-simple

An extra-simple one-page Bluesky tip & subscription page you can deploy to your own Cloudflare account in one click.

Built with [AT Protocol](https://atproto.com) and [aTIProto](https://atiproto.com).

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Yakrware/skytip-simple)

## What it does

- Visitors log in with Bluesky and send you a one-time tip or recurring subscription
- You control min/max amounts from your settings page
- Payments handled via aTIProto + Stripe

## Prerequisites

- A Cloudflare account (free tier works)
- A Bluesky account
- Connect your stripe account via [aTIProto.com](https://atiproto.com) to receive payments

## Configuration

Click the **Deploy to Cloudflare** button above. The setup page that opens
lets you fill in the one variable and attach the KV binding right there —
you don't need to visit your Cloudflare dashboard separately.

| Name | Type | Value |
|------|------|-------|
| `OWNER_HANDLE` | Variable | Your Bluesky handle, e.g. `alice.bsky.social` |
| `OAUTH_KV` | KV namespace binding | Create one and attach it |

`OAUTH_PRIVATE_JWK` (the key that enables OAuth silent sign-on) is generated
and stored as a secret automatically on first deploy via `scripts/ensure-secret.mjs`.
No operator action needed.

Log in to your skytip deploy and follow the instructions to connect to stripe.

## Local Development

```bash
npm install
```

Create a `.dev.vars` file at the repo root:

```
OWNER_HANDLE=alice.bsky.social
# Optional — paste a generated JWK on a single line to enable silent sign-on
OAUTH_PRIVATE_JWK=
```

Generate a dev JWK with `npm run generate-jwk`.

Then start the dev server:

```bash
npm run dev
```

## License

MIT — see [LICENSE](./LICENSE).

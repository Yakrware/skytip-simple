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

After deploying, set this in your Cloudflare Worker dashboard:

| Name | Type | Value |
|------|------|-------|
| `OWNER_HANDLE` | Variable | Your Bluesky handle, e.g. `alice.bsky.social` |

Create a KV namespace and bind it as `OAUTH_KV`.

Log in to your skytip deploy and follow the instructions to connect to stripe.

## Local Development

```bash
npm install
```

Create a `.dev.vars` file at the repo root with your Bluesky handle:

```
OWNER_HANDLE=alice.bsky.social
```

Then start the dev server:

```bash
npm run dev
```

## License

MIT — see [LICENSE](./LICENSE).

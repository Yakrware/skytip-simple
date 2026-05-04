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

## Updating from upstream

Cloudflare's **Deploy to Cloudflare** button creates your repo by cloning
this one rather than forking it. GitHub doesn't track an upstream link for
clones, so your copy won't show up in the fork network and won't offer the
usual "Sync fork" button. To pull in new releases of `skytip-simple`, pick
one of the options below.

### Option 1 — Manual upstream sync (recommended for customized repos)

Best if you've made local changes you want to keep. Add this repo as a git
remote once, then merge updates as they ship:

```bash
git remote add upstream https://github.com/Yakrware/skytip-simple.git
git fetch upstream
git merge upstream/main
git push origin main
```

Cloudflare will redeploy automatically once the push lands. Resolve any
merge conflicts with your local edits as you would for any other repo.

### Option 2 — Delete and recreate the Worker (easiest if you haven't customized)

If your repo is unchanged from the original deploy, the fastest path is to
delete the Worker in your Cloudflare dashboard and click **Deploy to
Cloudflare** again. The setup wizard lets you pick your existing
`OAUTH_KV` namespace, so your OAuth sessions survive the redeploy. Set
`OWNER_HANDLE` to the same value as before.

### Option 3 — Delete the GitHub repo and re-fork

Delete your GitHub repo, fork `Yakrware/skytip-simple` through GitHub's
fork button (which preserves the upstream link), then reconnect the new
fork in Cloudflare. You'll need to edit `wrangler.jsonc` to set
`OWNER_HANDLE` and to replace the `OAUTH_KV` `"id": "placeholder"` with
the id of your existing KV namespace (find it under **Workers & Pages →
KV** in the Cloudflare dashboard).

### Option 4 — Fork first, deploy manually

If you haven't deployed yet and prefer the easiest sync, skip
the one-click button. Fork `Yakrware/skytip-simple` on GitHub, create a
KV namespace in Cloudflare, edit `wrangler.jsonc` to set `OWNER_HANDLE`
and the KV `id`, then deploy with `npx wrangler deploy`. Future upstream
updates can be pulled with GitHub's built-in **Sync fork** button.

## License

MIT — see [LICENSE](./LICENSE).

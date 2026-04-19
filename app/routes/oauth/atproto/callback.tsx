import { redirect } from "react-router";
import { OAuthCallbackError } from "@atproto/oauth-client";
import { KvStateStore } from "@atiproto/kv-oauth-state-store";
import type { Route } from "./+types/callback";
import { cloudflareContext } from "~/middleware/cloudflare";
import {
  createOAuthClient,
  OAUTH_SCOPE_OWNER,
  OAUTH_SCOPE_VISITOR,
} from "~/lib/oauth/client";
import { fetchOwnerBskyProfile } from "~/lib/owner.server";
import { sessionCookieHeader } from "~/lib/session";

export async function loader({ request, context }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const params = url.searchParams;

  const { env } = context.get(cloudflareContext);
  const origin = url.origin;
  const ownerHandle = env.OWNER_HANDLE;

  // `state` in the URL is an opaque nonce; the handle we stashed as appState
  // is in KV under it. Peek so we can build the matching owner/visitor client
  // (their `client_id`s differ — a mismatch makes token exchange fail).
  const stateParam = params.get("state");
  const stateHandle = stateParam
    ? (await new KvStateStore(env.OAUTH_KV).get(stateParam))?.appState
    : undefined;
  const isOwner = stateHandle === ownerHandle;
  const client = await createOAuthClient(origin, env, isOwner);

  try {
    const { session: oauthSession } = await client.callback(params);

    // Sign-in flow carries the handle in state; create-account flow doesn't —
    // fall back to a bsky profile lookup in that case.
    const handle =
      stateHandle ?? (await fetchOwnerBskyProfile(oauthSession.did)).handle;

    throw redirect("/", {
      headers: {
        "Set-Cookie": sessionCookieHeader(oauthSession.did, handle),
      },
    });
  } catch (err) {
    if (err instanceof Response) throw err;

    // Silent sign-in (prompt:"none") failed — re-authorize with interactive flow
    if (
      err instanceof OAuthCallbackError &&
      ["login_required", "consent_required"].includes(
        err.params.get("error") ?? "",
      )
    ) {
      const handle = err.state;
      if (handle) {
        try {
          const scope =
            handle === ownerHandle ? OAUTH_SCOPE_OWNER : OAUTH_SCOPE_VISITOR;
          const authorizeUrl = await client.authorize(handle, {
            scope,
            state: handle,
          });
          throw redirect(authorizeUrl.toString());
        } catch (reauthErr) {
          if (reauthErr instanceof Response) throw reauthErr;
          console.error("OAuth re-authorize failed", reauthErr);
        }
      } else {
        console.error("OAuth login_required without a handle in appState", err);
      }
    } else {
      console.error("OAuth callback failed", err);
    }

    throw redirect("/?error=login_failed");
  }
}

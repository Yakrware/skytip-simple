import { redirect } from "react-router";
import { OAuthCallbackError } from "@atproto/oauth-client";
import type { Route } from "./+types/callback";
import { cloudflareContext } from "~/middleware/cloudflare";
import {
  createOAuthClient,
  OAUTH_SCOPE_OWNER,
  OAUTH_SCOPE_VISITOR,
} from "~/lib/oauth/client";
import { sessionCookieHeader } from "~/lib/session";

export async function loader({ request, context }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const params = url.searchParams;

  const { env } = context.get(cloudflareContext);
  const origin = url.origin;
  const ownerHandle = env.OWNER_HANDLE;
  const client = createOAuthClient(origin, env.OAUTH_KV, ownerHandle);

  try {
    const { session: oauthSession } = await client.callback(params);

    throw redirect("/", {
      headers: { "Set-Cookie": sessionCookieHeader(oauthSession.did) },
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
      const { handle } = parseState(err.state);
      if (handle) {
        const scope =
          handle === ownerHandle
            ? OAUTH_SCOPE_OWNER
            : OAUTH_SCOPE_VISITOR;
        const authorizeUrl = await client.authorize(handle, {
          scope,
          state: JSON.stringify({ handle }),
        });
        throw redirect(authorizeUrl.toString());
      }
    }

    throw redirect("/?error=login_failed");
  }
}

function parseState(state: string | null | undefined): { handle?: string } {
  if (!state) return {};
  try {
    return JSON.parse(state);
  } catch {
    return {};
  }
}

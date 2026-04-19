import { redirect } from "react-router";
import type { Route } from "./+types/logout";
import { cloudflareContext } from "~/middleware/cloudflare";
import { createOAuthClient } from "~/lib/oauth/client";
import {
  parseCookie,
  parseSessionValue,
  clearSessionCookieHeader,
} from "~/lib/session";

export async function action({ request, context }: Route.ActionArgs) {
  const { env } = context.get(cloudflareContext);
  const cookies = parseCookie(request.headers.get("Cookie") ?? "");
  const session = parseSessionValue(cookies["sid"]);

  if (session) {
    try {
      const origin = new URL(request.url).origin;
      const isOwner = session.handle === env.OWNER_HANDLE;
      const client = await createOAuthClient(origin, env, isOwner);
      await client.revoke(session.did);
    } catch {
      // Revocation failure is non-fatal — still clear the cookie
    }
  }

  throw redirect("/", {
    headers: { "Set-Cookie": clearSessionCookieHeader() },
  });
}

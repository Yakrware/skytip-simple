import { redirect, data } from "react-router";
import type { Route } from "./+types/login";
import { cloudflareContext } from "~/middleware/cloudflare";
import { createOAuthClient, OAUTH_SCOPE } from "~/lib/oauth/client";

export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData();
  const handle = (formData.get("handle") as string | null)?.trim();

  if (!handle) {
    return data({ error: "Please enter your handle." }, { status: 400 });
  }

  const { env } = context.get(cloudflareContext);
  const origin = new URL(request.url).origin;
  const client = createOAuthClient(origin, env.OAUTH_KV);

  try {
    const authorizeUrl = await client.authorize(handle, {
      scope: OAUTH_SCOPE,
      prompt: "none",
      state: JSON.stringify({ handle }),
    });

    throw redirect(authorizeUrl.toString());
  } catch (e) {
    if (e instanceof Response) throw e;
    const message =
      e instanceof Error ? e.message : "Could not resolve that handle.";
    return data({ error: message }, { status: 400 });
  }
}

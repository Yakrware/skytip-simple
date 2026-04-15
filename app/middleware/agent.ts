import { createContext, redirect } from "react-router";
import { Agent } from "@atiproto/agent";
import { createOAuthClient } from "~/lib/oauth/client";
import { clearSessionCookieHeader } from "~/lib/session";
import { cloudflareContext } from "./cloudflare";
import { authContext } from "./auth";

export const agentContext = createContext<Agent | null>();

export async function optionalAgent({
  request,
  context,
}: {
  request: Request;
  context: any;
}) {
  const auth = context.get(authContext);
  if (!auth) {
    context.set(agentContext, null);
    return;
  }
  const { env } = context.get(cloudflareContext);
  const origin = new URL(request.url).origin;
  try {
    const oauthClient = createOAuthClient(origin, env.OAUTH_KV);
    const oauthSession = await oauthClient.restore(auth.did);
    context.set(agentContext, new Agent(oauthSession));
  } catch {
    throw redirect("/", {
      headers: { "Set-Cookie": clearSessionCookieHeader() },
    });
  }
}

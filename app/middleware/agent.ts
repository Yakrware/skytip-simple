import { createContext, redirect } from "react-router";
import { Agent } from "@atiproto/agent";
import { createOAuthClient } from "~/lib/oauth/client";
import { clearSessionCookieHeader } from "~/lib/session";
import { cloudflareContext } from "./cloudflare";
import { authContext } from "./auth";

export const agentContext = createContext<Agent>();

export async function requireAgent({
  request,
  context,
}: {
  request: Request;
  context: any;
}) {
  const auth = context.get(authContext);
  const { env } = context.get(cloudflareContext);
  const origin = new URL(request.url).origin;
  try {
    const isOwner = auth.handle === env.OWNER_HANDLE;
    const oauthClient = await createOAuthClient(origin, env, isOwner);
    const oauthSession = await oauthClient.restore(auth.did);
    context.set(agentContext, new Agent(oauthSession));
  } catch {
    throw redirect("/oauth/atproto/login", {
      headers: { "Set-Cookie": clearSessionCookieHeader() },
    });
  }
}

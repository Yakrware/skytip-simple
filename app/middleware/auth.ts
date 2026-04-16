import { createContext, redirect } from "react-router";
import { getOptionalSession } from "~/lib/auth.server";
import { cloudflareContext } from "./cloudflare";

export interface AuthInfo {
  did: string;
}

export const authContext = createContext<AuthInfo>();

export async function requireAuth({
  request,
  context,
}: {
  request: Request;
  context: any;
}) {
  const { env } = context.get(cloudflareContext);
  const session = await getOptionalSession(request, env.OAUTH_KV);
  if (!session) {
    throw redirect("/oauth/atproto/login");
  }
  context.set(authContext, { did: session.did });
}

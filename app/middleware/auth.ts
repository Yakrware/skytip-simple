import { createContext } from "react-router";
import { getOptionalSession } from "~/lib/auth.server";
import { cloudflareContext } from "./cloudflare";

export interface AuthInfo {
  did: string;
}

export const authContext = createContext<AuthInfo | null>();

export async function optionalAuth({
  request,
  context,
}: {
  request: Request;
  context: any;
}) {
  const { env } = context.get(cloudflareContext);
  const session = await getOptionalSession(request, env.OAUTH_KV);
  context.set(authContext, session ? { did: session.did } : null);
}

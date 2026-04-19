import type { Route } from "./+types/client-metadata";
import { cloudflareContext } from "~/middleware/cloudflare";
import { buildClientMetadata } from "~/lib/oauth/client";
import { getKeyset } from "@atiproto/edge-oauth-client";

export async function loader({ request, context }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const url = new URL(request.url);
  const isOwner = url.searchParams.get("owner") === "true";
  const keyset = await getKeyset(env.OAUTH_PRIVATE_JWK);
  return Response.json(
    buildClientMetadata(url.origin, env.OWNER_HANDLE, isOwner, keyset),
  );
}

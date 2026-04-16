import type { Route } from "./+types/client-metadata";
import { cloudflareContext } from "~/middleware/cloudflare";
import { buildClientMetadata } from "~/lib/oauth/client";

export async function loader({ request, context }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const origin = new URL(request.url).origin;
  return Response.json(buildClientMetadata(origin, env.OWNER_HANDLE));
}

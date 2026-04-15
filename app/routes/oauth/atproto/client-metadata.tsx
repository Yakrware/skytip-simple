import type { Route } from "./+types/client-metadata";
import { buildClientMetadata } from "~/lib/oauth/client";

export async function loader({ request }: Route.LoaderArgs) {
  const origin = new URL(request.url).origin;
  return Response.json(buildClientMetadata(origin));
}

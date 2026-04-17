import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  // OAuth routes — outside layout (no auth/agent middleware needed)
  route(
    "oauth/atproto/client-metadata.json",
    "routes/oauth/atproto/client-metadata.tsx",
  ),
  route("oauth/atproto/callback", "routes/oauth/atproto/callback.tsx"),
  route("oauth/atproto/login", "routes/oauth/atproto/login.tsx"),
  route("oauth/atproto/logout", "routes/oauth/atproto/logout.tsx"),

  // App routes — inside layout (requireAuth + requireAgent middleware)
  layout("routes/_layout.tsx", [
    index("routes/_index.tsx"),
    route("owner", "routes/owner.tsx"),
  ]),
] satisfies RouteConfig;

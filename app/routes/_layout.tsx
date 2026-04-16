import { Outlet } from "react-router";
import type { Route } from "./+types/_layout";
import { requireAuth } from "~/middleware/auth";
import { requireAgent } from "~/middleware/agent";

export const middleware: Route.MiddlewareFunction[] = [
  requireAuth,
  requireAgent,
];

export default function AppLayout() {
  return <Outlet />;
}

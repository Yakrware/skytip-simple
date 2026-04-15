import { Outlet } from "react-router";
import type { Route } from "./+types/_layout";
import { optionalAuth } from "~/middleware/auth";
import { optionalAgent } from "~/middleware/agent";

export const middleware: Route.MiddlewareFunction[] = [
  optionalAuth,
  optionalAgent,
];

export default function AppLayout() {
  return <Outlet />;
}

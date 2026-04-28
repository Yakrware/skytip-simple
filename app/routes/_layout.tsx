import { useEffect, useRef } from "react";
import { Form, Outlet } from "react-router";
import type { Route } from "./+types/_layout";
import { authContext, requireAuth } from "~/middleware/auth";
import { requireAgent } from "~/middleware/agent";

export const middleware: Route.MiddlewareFunction[] = [
  requireAuth,
  requireAgent,
];

export async function loader({ context }: Route.LoaderArgs) {
  const auth = context.get(authContext);
  return { handle: auth.handle ?? auth.did };
}

export default function AppLayout({ loaderData }: Route.ComponentProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const el = detailsRef.current;
      if (!el?.open) return;
      if (e.target instanceof Node && !el.contains(e.target)) {
        el.open = false;
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <>
      <div className="mx-auto flex max-w-5xl items-center justify-end gap-2 px-4 pt-3 text-sm text-text-muted">
        <span>
          Logged in as <span className="text-text">@{loaderData.handle}</span>
        </span>
        <details ref={detailsRef} className="relative">
          <summary className="flex cursor-pointer list-none items-center rounded p-1 hover:text-text [&::-webkit-details-marker]:hidden">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-label="Account menu"
              className="h-4 w-4"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </summary>
          <div className="absolute top-full right-0 mt-1 rounded-lg border border-border bg-surface p-1 shadow-md">
            <Form method="post" action="/oauth/atproto/logout">
              <button
                type="submit"
                className="cursor-pointer rounded px-3 py-1.5 text-sm text-text hover:bg-surface-subtle"
              >
                Logout
              </button>
            </Form>
          </div>
        </details>
      </div>
      <Outlet />
    </>
  );
}

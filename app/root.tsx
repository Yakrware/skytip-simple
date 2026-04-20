import {
  Form,
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "skytip" },
    { name: "description", content: "Send tips and subscriptions on Bluesky" },
  ];
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-surface font-[system-ui] text-text">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Something went wrong";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      message = "Page not found";
      details = "The page you were looking for doesn't exist.";
    } else {
      message = `Error ${error.status}`;
      details = error.statusText || details;
    }
  } else if (error instanceof Error) {
    details = error.message;
    if (import.meta.env.DEV) stack = error.stack;
  }

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 px-4 py-12">
      <h1 className="text-2xl font-bold text-text">{message}</h1>
      <p className="text-sm text-text-muted">{details}</p>
      <p className="text-sm text-text-muted">
        If this keeps happening, sign out and back in to refresh your session.
      </p>
      <div className="flex gap-3">
        <Link
          to="/"
          className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-border px-4 py-2 font-semibold text-text transition-colors hover:bg-surface-subtle"
        >
          Go home
        </Link>
        <Form method="post" action="/oauth/atproto/logout">
          <button
            type="submit"
            className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-brand px-4 py-2 font-semibold text-white transition-colors hover:bg-brand-hover"
          >
            Sign out
          </button>
        </Form>
      </div>
      {stack && (
        <pre className="mt-4 w-full overflow-x-auto rounded-lg border border-border bg-surface-subtle p-4 text-xs">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}

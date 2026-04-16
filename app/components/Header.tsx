import { Form, Link } from "react-router";
import { Avatar } from "./Avatar";

export function Header({
  session,
}: {
  session?: { handle: string; avatar?: string } | null;
}) {
  return (
    <header className="flex items-center justify-between border-b border-border px-4 py-3">
      <Link to="/" className="text-lg font-bold text-text no-underline">
        skytip
      </Link>

      {session && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Avatar src={session.avatar} name={session.handle} size="sm" />
            <span className="text-sm text-text-muted">@{session.handle}</span>
          </div>
          <Form method="post" action="/oauth/atproto/logout">
            <button
              type="submit"
              className="cursor-pointer text-sm text-text-muted hover:text-text"
            >
              Sign out
            </button>
          </Form>
        </div>
      )}
    </header>
  );
}

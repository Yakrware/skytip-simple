import { redirect, data, useLoaderData } from "react-router";
import { Agent } from "@atproto/api";
import { EdgeXrpcHandleResolver } from "@atiproto/edge-resolvers";
import type { Route } from "./+types/login";
import { cloudflareContext } from "~/middleware/cloudflare";
import {
  createOAuthClient,
  OAUTH_SCOPE_OWNER,
  OAUTH_SCOPE_VISITOR,
} from "~/lib/oauth/client";
import { Avatar } from "~/components/Avatar";
import { ErrorBanner } from "~/components/ErrorBanner";
import { LoginForm } from "~/components/LoginForm";

export async function loader({ request, context }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const error = url.searchParams.get("error") ?? null;

  const { env } = context.get(cloudflareContext);
  const ownerHandle = env.OWNER_HANDLE;

  const publicApi = "https://public.api.bsky.app";
  const handleResolver = new EdgeXrpcHandleResolver(publicApi);
  const ownerDid = await handleResolver.resolve(ownerHandle);

  let ownerProfile: {
    displayName: string;
    handle: string;
    avatar?: string;
  } = { displayName: ownerHandle, handle: ownerHandle };

  if (ownerDid) {
    try {
      const agent = new Agent(publicApi);
      const { data: profile } = await agent.getProfile({ actor: ownerDid });
      ownerProfile = {
        displayName: profile.displayName || profile.handle,
        handle: profile.handle,
        avatar: profile.avatar,
      };
    } catch {
      // Fall back to handle-only profile
    }
  }

  return { ownerProfile, error };
}

export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent") as string | null;
  const handle = (formData.get("handle") as string | null)?.trim();

  const { env } = context.get(cloudflareContext);
  const origin = new URL(request.url).origin;
  const client = createOAuthClient(origin, env.OAUTH_KV, env.OWNER_HANDLE);

  // "Create account" flow — no handle needed, user registers at their PDS
  if (intent === "create") {
    try {
      const authorizeUrl = await client.authorize("", {
        scope: OAUTH_SCOPE_VISITOR,
        prompt: "create",
        state: JSON.stringify({}),
      });
      throw redirect(authorizeUrl.toString());
    } catch (e) {
      if (e instanceof Response) throw e;
      const message =
        e instanceof Error ? e.message : "Could not start account creation.";
      return data({ error: message }, { status: 400 });
    }
  }

  // "Sign in" flow — handle required
  if (!handle) {
    return data({ error: "Please enter your handle." }, { status: 400 });
  }

  const scope =
    handle === env.OWNER_HANDLE ? OAUTH_SCOPE_OWNER : OAUTH_SCOPE_VISITOR;

  try {
    const authorizeUrl = await client.authorize(handle, {
      scope,
      prompt: "none",
      state: JSON.stringify({ handle }),
    });

    throw redirect(authorizeUrl.toString());
  } catch (e) {
    if (e instanceof Response) throw e;
    const message =
      e instanceof Error ? e.message : "Could not resolve that handle.";
    return data({ error: message }, { status: 400 });
  }
}

export default function LoginPage() {
  const { ownerProfile, error } = useLoaderData<typeof loader>();

  return (
    <main className="mx-auto flex max-w-[480px] flex-col gap-6 px-4 py-12">
      <div className="flex flex-col items-center gap-3 text-center">
        <Avatar
          src={ownerProfile.avatar}
          name={ownerProfile.displayName}
          size="lg"
        />
        <div>
          <p className="text-lg font-semibold text-text">
            {ownerProfile.displayName}
          </p>
          <p className="text-sm text-text-muted">@{ownerProfile.handle}</p>
        </div>
      </div>

      <div className="text-center">
        <h1 className="text-xl font-bold text-text">
          Send {ownerProfile.displayName} a tip or subscribe
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          Sign in with your Bluesky account to continue. Your tips are linked to
          your Bluesky identity so {ownerProfile.displayName} knows who you are.
        </p>
      </div>

      {error === "login_failed" && (
        <ErrorBanner message="Sign-in failed. Please try again." />
      )}

      <LoginForm />
    </main>
  );
}

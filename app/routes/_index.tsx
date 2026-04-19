import {
  redirect,
  useLoaderData,
  useActionData,
  useNavigation,
  data,
} from "react-router";
import type { Route } from "./+types/_index";
import { cloudflareContext } from "~/middleware/cloudflare";
import { authContext } from "~/middleware/auth";
import { agentContext } from "~/middleware/agent";
import {
  resolveOwner,
  resolveOwnerPds,
  fetchOwnerBskyProfile,
  loadOwnerSettings,
  applyDefaults,
} from "~/lib/owner.server";
import {
  createTip,
  createSubscription,
  cancelSubscription,
} from "~/lib/visitor.server";
import { ActiveSubscriptionPanel } from "~/components/ActiveSubscriptionPanel";
import { Card } from "~/components/Card";
import { ErrorBanner } from "~/components/ErrorBanner";
import { OwnerCard } from "~/components/OwnerCard";
import { SubscribePanel } from "~/components/SubscribePanel";
import { TipPanel } from "~/components/TipPanel";

export async function loader({ request, context }: Route.LoaderArgs) {
  const env = context.get(cloudflareContext).env;
  const auth = context.get(authContext);
  const agent = context.get(agentContext);

  // Owner → redirect to owner dashboard (skip owner DID resolution)
  if (auth.handle === env.OWNER_HANDLE) throw redirect("/owner");

  const ownerDid = await resolveOwner(env);
  const ownerPds = await resolveOwnerPds(ownerDid);

  // Public reads
  const [ownerProfile, rawSettings] = await Promise.all([
    fetchOwnerBskyProfile(ownerDid),
    loadOwnerSettings(ownerDid, ownerPds),
  ]);
  const settings = applyDefaults(rawSettings ?? {});

  // Authenticated reads
  const atiprotoProfile = await agent.com.atiproto.repo.profile.get({
    did: ownerDid,
  });

  const acceptsTips = atiprotoProfile.data.profile.acceptsTips ?? true;
  const acceptsSubscriptions =
    atiprotoProfile.data.profile.acceptsSubscriptions ?? true;

  let activeSubscription = null;
  try {
    const { data } = await agent.com.atiproto.feed.subscription.get({
      subject: ownerDid,
    });
    if (data.subscription.status === "active")
      activeSubscription = data.subscription;
  } catch {
    // No subscription to this creator
  }

  const url = new URL(request.url);
  return {
    ownerProfile,
    settings,
    acceptsTips,
    acceptsSubscriptions,
    activeSubscription,
    successMessage:
      url.searchParams.get("success") === "true"
        ? "Your payment is on its way!"
        : null,
    cancelledMessage:
      url.searchParams.get("cancelled") === "true"
        ? "Subscription cancelled."
        : null,
    accessUntil: url.searchParams.get("accessUntil") ?? null,
    error: url.searchParams.get("error") ?? null,
  };
}

export function meta({ data }: Route.MetaArgs) {
  if (!data) return [];
  const { ownerProfile } = data;
  return [
    { title: `Send ${ownerProfile.displayName} a tip` },
    { property: "og:title", content: `Send ${ownerProfile.displayName} a tip` },
    {
      property: "og:description",
      content: ownerProfile.description ?? "",
    },
    ...(ownerProfile.avatar
      ? [{ property: "og:image", content: ownerProfile.avatar }]
      : []),
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ];
}

export async function action({ request, context }: Route.ActionArgs) {
  const env = context.get(cloudflareContext).env;
  const agent = context.get(agentContext);
  const ownerDid = await resolveOwner(env);
  const ownerPds = await resolveOwnerPds(ownerDid);
  const settings = applyDefaults(
    (await loadOwnerSettings(ownerDid, ownerPds)) ?? {},
  );
  const origin = new URL(request.url).origin;

  const form = await request.formData();
  const intent = form.get("intent");

  if (intent === "tip") {
    return createTip({ form, agent, ownerDid, settings, origin });
  }
  if (intent === "subscribe") {
    return createSubscription({ form, agent, ownerDid, settings });
  }
  if (intent === "cancel") {
    return cancelSubscription({ form, agent });
  }
  return data({ error: "Unknown action" }, { status: 400 });
}

export default function VisitorPage() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const busy = navigation.state !== "idle";

  const {
    ownerProfile,
    settings,
    acceptsTips,
    acceptsSubscriptions,
    activeSubscription,
    successMessage,
    cancelledMessage,
    accessUntil,
    error: urlError,
  } = loaderData;

  const errorMessage = urlError ?? actionData?.error;

  return (
    <div className="mx-auto max-w-md space-y-4 p-4">
      <OwnerCard profile={ownerProfile} />

      {successMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
          {successMessage}
        </div>
      )}

      {cancelledMessage && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          {cancelledMessage}
          {accessUntil && (
            <>
              {" "}
              Your access remains active until{" "}
              {new Date(accessUntil).toLocaleDateString()}.
            </>
          )}
        </div>
      )}

      {errorMessage && <ErrorBanner message={errorMessage} />}

      {!acceptsTips && !acceptsSubscriptions && (
        <Card>
          <p className="text-center text-text-muted">
            {ownerProfile.displayName} is not currently accepting tips or
            subscriptions.
          </p>
        </Card>
      )}

      {acceptsTips && (
        <TipPanel
          minTipAmount={settings.minTipAmount}
          maxTipAmount={settings.maxTipAmount}
          suggestedTipAmount={settings.suggestedTipAmount}
          alwaysPrivate={settings.alwaysPrivate}
          busy={busy}
        />
      )}

      {acceptsSubscriptions &&
        (activeSubscription ? (
          <ActiveSubscriptionPanel
            subscription={activeSubscription}
            ownerDisplayName={ownerProfile.displayName}
            busy={busy}
          />
        ) : (
          <SubscribePanel
            minSubscriptionAmount={settings.minSubscriptionAmount}
            maxSubscriptionAmount={settings.maxSubscriptionAmount}
            alwaysPrivate={settings.alwaysPrivate}
            busy={busy}
          />
        ))}
    </div>
  );
}

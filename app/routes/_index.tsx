import { redirect, useLoaderData, useActionData, Form, useNavigation, data } from "react-router";
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
  dollarsToCents,
} from "~/lib/owner.server";
import { centsToDollars } from "~/lib/currency";
import { Card } from "~/components/Card";
import { Button } from "~/components/Button";
import { AmountInput } from "~/components/AmountInput";
import { ErrorBanner } from "~/components/ErrorBanner";
import { Avatar } from "~/components/Avatar";

export async function loader({ request, context }: Route.LoaderArgs) {
  const env = context.get(cloudflareContext).env;
  const auth = context.get(authContext);
  const agent = context.get(agentContext);
  const ownerDid = await resolveOwner(env);

  // Owner → redirect to owner dashboard
  if (auth.did === ownerDid) throw redirect("/owner");

  const ownerPds = await resolveOwnerPds(ownerDid);

  // Public reads
  const [ownerProfile, rawSettings] = await Promise.all([
    fetchOwnerBskyProfile(ownerDid),
    loadOwnerSettings(ownerDid, ownerPds),
  ]);
  const settings = applyDefaults(rawSettings ?? {});

  // Authenticated reads
  const [atiprotoProfile, subscriptions] = await Promise.all([
    agent.com.atiproto.repo.profile.get({ did: ownerDid }),
    agent.com.atiproto.repo.subscription.search({ subject: ownerDid }),
  ]);

  const acceptsTips = atiprotoProfile.data.profile.acceptsTips ?? true;
  const acceptsSubscriptions =
    atiprotoProfile.data.profile.acceptsSubscriptions ?? true;

  const activeSub = subscriptions.data.subscriptions.find(
    (s) => s.record.status === "active",
  );
  const activeSubscription = activeSub
    ? {
        uri: activeSub.uri,
        amount: activeSub.record.amount,
        interval: activeSub.record.interval,
      }
    : null;

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

const PAYMENT_NOT_CONNECTED_ERROR =
  "This creator hasn't connected a payment account yet. They can set one up at atiproto.com/connect.";

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
    const amountCents = dollarsToCents(form.get("amount"));
    if (amountCents < (settings.minTipAmount ?? 100)) {
      return data(
        { error: `Minimum tip is $${centsToDollars(settings.minTipAmount ?? 100)}` },
        { status: 400 },
      );
    }
    if (settings.maxTipAmount && amountCents > settings.maxTipAmount) {
      return data(
        { error: `Maximum tip is $${centsToDollars(settings.maxTipAmount)}` },
        { status: 400 },
      );
    }

    try {
      const { data: tipData } = await agent.com.atiproto.feed.tip.create({
        subject: ownerDid,
        amount: amountCents,
        currency: settings.currency ?? "USD",
        message: (form.get("message") as string) || undefined,
        redirectUrl: origin + "/?success=true",
      });
      if (tipData.checkoutUrl) return redirect(tipData.checkoutUrl);
      return redirect("/?success=true");
    } catch (err) {
      return data(
        {
          error: PAYMENT_NOT_CONNECTED_ERROR,
        },
        { status: 400 },
      );
    }
  }

  if (intent === "subscribe") {
    const amountCents = dollarsToCents(form.get("amount"));
    const interval = (form.get("interval") as string) || "monthly";
    if (amountCents < (settings.minSubscriptionAmount ?? 100)) {
      return data(
        {
          error: `Minimum subscription is $${centsToDollars(settings.minSubscriptionAmount ?? 100)}/mo`,
        },
        { status: 400 },
      );
    }
    if (
      settings.maxSubscriptionAmount &&
      amountCents > settings.maxSubscriptionAmount
    ) {
      return data(
        {
          error: `Maximum subscription is $${centsToDollars(settings.maxSubscriptionAmount)}/mo`,
        },
        { status: 400 },
      );
    }

    try {
      const { data: subData } =
        await agent.com.atiproto.feed.subscription.create({
          subject: ownerDid,
          amount: amountCents,
          currency: settings.currency ?? "USD",
          interval: interval as "monthly" | "yearly",
        });
      if (subData.checkoutUrl) return redirect(subData.checkoutUrl);
      return redirect("/?success=true");
    } catch (err) {
      return data(
        {
          error: PAYMENT_NOT_CONNECTED_ERROR,
        },
        { status: 400 },
      );
    }
  }

  if (intent === "cancel") {
    const subscriptionUri = form.get("subscriptionUri") as string;
    const { data: cancelData } =
      await agent.com.atiproto.feed.subscription.cancel({ subscriptionUri });
    return redirect(
      `/?cancelled=true&accessUntil=${encodeURIComponent(cancelData.accessUntil)}`,
    );
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

  const defaultTipAmount =
    settings.suggestedTipAmount ?? settings.minTipAmount ?? 100;
  const quickAmounts = [
    settings.minTipAmount ?? 100,
    defaultTipAmount,
    settings.maxTipAmount
      ? Math.min(defaultTipAmount * 2, settings.maxTipAmount)
      : defaultTipAmount * 2,
  ];
  const uniqueQuickAmounts = [...new Set(quickAmounts)];

  const errorMessage = urlError ?? actionData?.error;

  return (
    <div className="mx-auto max-w-md space-y-4 p-4">
      {/* Owner Card */}
      <Card>
        <div className="flex items-center gap-3">
          <Avatar
            src={ownerProfile.avatar}
            name={ownerProfile.displayName}
            size="lg"
          />
          <div>
            <h1 className="text-lg font-bold text-text">
              {ownerProfile.displayName}
            </h1>
            <p className="text-sm text-text-muted">@{ownerProfile.handle}</p>
          </div>
        </div>
        {ownerProfile.description && (
          <p className="mt-3 text-sm text-text-muted">
            {ownerProfile.description}
          </p>
        )}
      </Card>

      {/* Banners */}
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

      {/* Not accepting anything */}
      {!acceptsTips && !acceptsSubscriptions && (
        <Card>
          <p className="text-center text-text-muted">
            {ownerProfile.displayName} is not currently accepting tips or
            subscriptions.
          </p>
        </Card>
      )}

      {/* Tip Panel */}
      {acceptsTips && (
        <Card title="Send a tip">
          <Form method="post" className="space-y-3">
            <input type="hidden" name="intent" value="tip" />

            <AmountInput
              name="amount"
              label="Amount"
              min={settings.minTipAmount}
              max={settings.maxTipAmount}
              defaultValue={defaultTipAmount}
            />

            {/* Quick-select buttons */}
            <div className="flex gap-2">
              {uniqueQuickAmounts.map((cents) => (
                <button
                  key={cents}
                  type="button"
                  className="rounded-lg border border-border px-3 py-1 text-sm text-text hover:bg-surface-subtle"
                  onClick={(e) => {
                    const input = (
                      e.currentTarget.closest("form") as HTMLFormElement
                    ).querySelector<HTMLInputElement>('input[name="amount"]');
                    if (input) input.value = centsToDollars(cents);
                  }}
                >
                  ${centsToDollars(cents)}
                </button>
              ))}
            </div>

            <div>
              <label
                htmlFor="tip-message"
                className="mb-1 block text-sm font-medium text-text"
              >
                Message (optional)
              </label>
              <textarea
                id="tip-message"
                name="message"
                maxLength={500}
                rows={2}
                placeholder="Add a message..."
                className="w-full rounded-lg border border-border bg-surface-subtle p-2 text-sm text-text placeholder:text-text-muted focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none"
              />
            </div>

            <Button type="submit" disabled={busy} loading={busy}>
              Send tip
            </Button>
          </Form>
        </Card>
      )}

      {/* Subscription Panel */}
      {acceptsSubscriptions &&
        (activeSubscription ? (
          <Card title="Your subscription">
            <p className="mb-3 text-sm text-text">
              You&apos;re subscribed to{" "}
              <strong>{ownerProfile.displayName}</strong>
            </p>
            <p className="mb-3 text-text-muted">
              ${centsToDollars(activeSubscription.amount)}/
              {activeSubscription.interval === "yearly" ? "year" : "month"} ·{" "}
              <span className="text-green-600 dark:text-green-400">active</span>
            </p>
            <Form method="post">
              <input type="hidden" name="intent" value="cancel" />
              <input
                type="hidden"
                name="subscriptionUri"
                value={activeSubscription.uri}
              />
              <Button
                type="submit"
                variant="secondary"
                disabled={busy}
                loading={busy}
              >
                Cancel subscription
              </Button>
            </Form>
          </Card>
        ) : (
          <Card title="Subscribe">
            <Form method="post" className="space-y-3">
              <input type="hidden" name="intent" value="subscribe" />
              <input type="hidden" name="interval" value="monthly" />

              <AmountInput
                name="amount"
                label="Monthly amount"
                min={settings.minSubscriptionAmount}
                max={settings.maxSubscriptionAmount}
                defaultValue={settings.minSubscriptionAmount ?? 100}
              />

              <Button type="submit" disabled={busy} loading={busy}>
                Subscribe $
                {centsToDollars(settings.minSubscriptionAmount ?? 100)}
                /mo
              </Button>
            </Form>
          </Card>
        ))}
    </div>
  );
}

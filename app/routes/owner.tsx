import { redirect, Form, useNavigation } from "react-router";
import type { Route } from "./+types/owner";
import { cloudflareContext } from "~/middleware/cloudflare";
import { authContext } from "~/middleware/auth";
import { agentContext } from "~/middleware/agent";
import {
  resolveOwner,
  resolveOwnerPds,
  loadOwnerSettings,
  applyDefaults,
  dollarsToCents,
  optionalDollarsToCents,
} from "~/lib/owner.server";
import { clearSessionCookieHeader } from "~/lib/session";
import { Card } from "~/components/Card";
import { Button } from "~/components/Button";
import { AmountInput } from "~/components/AmountInput";

export async function loader({ request, context }: Route.LoaderArgs) {
  const env = context.get(cloudflareContext).env;
  const auth = context.get(authContext);
  const agent = context.get(agentContext);

  if (!auth || auth.handle !== env.OWNER_HANDLE || !agent) {
    throw redirect("/");
  }

  const ownerDid = await resolveOwner(env);
  // Defense against a spoofed handle in the cookie
  if (auth.did !== ownerDid) {
    throw redirect("/", {
      headers: { "Set-Cookie": clearSessionCookieHeader() },
    });
  }

  const ownerPds = await resolveOwnerPds(ownerDid);
  const [settings, atiprotoProfile] = await Promise.all([
    loadOwnerSettings(ownerDid, ownerPds),
    agent.com.atiproto.account.profile.get(),
  ]);

  const url = new URL(request.url);
  const connectUrl = new URL("https://atiproto.com/connect");
  connectUrl.searchParams.set("redirect_url", `${url.origin}/owner`);
  return {
    settings: applyDefaults(settings ?? {}),
    acceptsTips: atiprotoProfile.data.profile.acceptsTips ?? true,
    acceptsSubscriptions:
      atiprotoProfile.data.profile.acceptsSubscriptions ?? true,
    readyForPayment: atiprotoProfile.data.readyForPayment,
    saved: url.searchParams.get("saved") === "true",
    connectUrl: connectUrl.toString(),
  };
}

export async function action({ request, context }: Route.ActionArgs) {
  const env = context.get(cloudflareContext).env;
  const auth = context.get(authContext);
  const agent = context.get(agentContext);

  if (!auth || auth.handle !== env.OWNER_HANDLE || !agent) {
    throw new Response("Forbidden", { status: 403 });
  }

  const ownerDid = await resolveOwner(env);
  // Defense against a spoofed handle in the cookie
  if (auth.did !== ownerDid) {
    throw new Response("Forbidden", {
      status: 403,
      headers: { "Set-Cookie": clearSessionCookieHeader() },
    });
  }

  const form = await request.formData();

  await Promise.all([
    agent.com.atproto.repo.putRecord({
      repo: ownerDid,
      collection: "skytip.simple.settings",
      rkey: "self",
      record: {
        minTipAmount: dollarsToCents(form.get("minTipAmount")),
        maxTipAmount: optionalDollarsToCents(form.get("maxTipAmount")),
        suggestedTipAmount: optionalDollarsToCents(
          form.get("suggestedTipAmount"),
        ),
        minSubscriptionAmount: dollarsToCents(
          form.get("minSubscriptionAmount"),
        ),
        maxSubscriptionAmount: optionalDollarsToCents(
          form.get("maxSubscriptionAmount"),
        ),
        currency: "USD",
        alwaysPrivate: form.get("alwaysPrivate") === "true",
      },
    }),
    agent.com.atiproto.account.profile.put({
      acceptsTips: form.get("acceptsTips") === "true",
      acceptsSubscriptions: form.get("acceptsSubscriptions") === "true",
    }),
  ]);

  return redirect("/owner?saved=true");
}

function Toggle({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex items-center justify-between gap-3">
      <span className="text-sm font-medium text-text">{label}</span>
      <input
        type="checkbox"
        name={name}
        value="true"
        defaultChecked={defaultChecked}
        className="h-5 w-5 rounded border-border text-brand focus:ring-brand"
      />
    </label>
  );
}

export default function OwnerSettings({ loaderData }: Route.ComponentProps) {
  const {
    settings,
    acceptsTips,
    acceptsSubscriptions,
    readyForPayment,
    saved,
    connectUrl,
  } = loaderData;
  const navigation = useNavigation();
  const isSaving = navigation.state === "submitting";

  return (
    <div className="mx-auto max-w-lg space-y-4 p-4">
      <h1 className="text-2xl font-bold text-text">Settings</h1>

      {!readyForPayment && (
        <div
          role="alert"
          className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"
        >
          Your account is not ready to receive payments.{" "}
          <a href={connectUrl} className="font-medium underline">
            Connect your account
          </a>{" "}
          to get started.
        </div>
      )}

      {readyForPayment && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
          Payment account connected.
        </div>
      )}

      {saved && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
          Settings saved.
        </div>
      )}

      <Form method="post">
        <Card className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-text">Accept payments</h2>
            <Toggle
              name="acceptsTips"
              label="Accept tips"
              defaultChecked={acceptsTips}
            />
            <Toggle
              name="acceptsSubscriptions"
              label="Accept subscriptions"
              defaultChecked={acceptsSubscriptions}
            />
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-text">Tip limits</h2>
            <AmountInput
              name="minTipAmount"
              label="Minimum tip"
              defaultValue={settings.minTipAmount}
            />
            <AmountInput
              name="maxTipAmount"
              label="Maximum tip (optional)"
              defaultValue={settings.maxTipAmount}
            />
            <AmountInput
              name="suggestedTipAmount"
              label="Suggested tip (optional)"
              defaultValue={settings.suggestedTipAmount}
            />
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-text">
              Subscription limits
            </h2>
            <AmountInput
              name="minSubscriptionAmount"
              label="Minimum monthly subscription"
              defaultValue={settings.minSubscriptionAmount}
            />
            <AmountInput
              name="maxSubscriptionAmount"
              label="Maximum monthly subscription (optional)"
              defaultValue={settings.maxSubscriptionAmount}
            />
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-text">Privacy</h2>
            <Toggle
              name="alwaysPrivate"
              label="Always make tips and subscriptions private. This hides the recipient of a tip/subscription from a user's public record."
              defaultChecked={!!settings.alwaysPrivate}
            />
          </div>

          <Button type="submit" loading={isSaving}>
            {isSaving ? "Saving..." : "Save settings"}
          </Button>
        </Card>
      </Form>
    </div>
  );
}

import { redirect, data } from "react-router";
import type { Agent } from "@atiproto/agent";
import { dollarsToCents, centsToDollars, type DidString } from "./owner.server";
import type { Main as SkytipSettings } from "~/lexicons/skytip/simple/settings";

type UriString = `${string}:${string}`;
type CancelInput = Parameters<
  Agent["com"]["atiproto"]["feed"]["subscription"]["cancel"]
>[0];

export async function createTip({
  form,
  agent,
  ownerDid,
  settings,
  origin,
}: {
  form: FormData;
  agent: Agent;
  ownerDid: DidString;
  settings: SkytipSettings;
  origin: string;
}) {
  const amountCents = dollarsToCents(form.get("amount"));
  if (amountCents < (settings.minTipAmount ?? 100)) {
    return data(
      {
        error: `Minimum tip is $${centsToDollars(settings.minTipAmount ?? 100)}`,
      },
      { status: 400 },
    );
  }
  if (settings.maxTipAmount && amountCents > settings.maxTipAmount) {
    return data(
      { error: `Maximum tip is $${centsToDollars(settings.maxTipAmount)}` },
      { status: 400 },
    );
  }

  const { data: tipData } = await agent.com.atiproto.feed.tip.create({
    subject: ownerDid,
    amount: amountCents,
    currency: settings.currency ?? "USD",
    message: (form.get("message") as string) || undefined,
    redirectUrl: (origin + "/?success=true") as UriString,
    isPrivate: form.get("isPrivate") === "true",
  });
  if (tipData.checkoutUrl) return redirect(tipData.checkoutUrl);
  return redirect("/?success=true");
}

export async function createSubscription({
  form,
  agent,
  ownerDid,
  settings,
}: {
  form: FormData;
  agent: Agent;
  ownerDid: DidString;
  settings: SkytipSettings;
}) {
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

  const { data: subData } = await agent.com.atiproto.feed.subscription.create({
    subject: ownerDid,
    amount: amountCents,
    currency: settings.currency ?? "USD",
    interval: interval as "monthly" | "yearly",
    isPrivate: form.get("isPrivate") === "true",
  });
  if (subData.checkoutUrl) return redirect(subData.checkoutUrl);
  return redirect("/?success=true");
}

export async function cancelSubscription({
  form,
  agent,
}: {
  form: FormData;
  agent: Agent;
}) {
  const subscriptionUri = form.get(
    "subscriptionUri",
  ) as CancelInput["subscriptionUri"];
  const { data: cancelData } =
    await agent.com.atiproto.feed.subscription.cancel({ subscriptionUri });
  return redirect(
    `/?cancelled=true&accessUntil=${encodeURIComponent(cancelData.accessUntil)}`,
  );
}

import { Form } from "react-router";
import { centsToDollars } from "~/lib/currency";
import { Button } from "./Button";
import { Card } from "./Card";

export function ActiveSubscriptionPanel({
  subscription,
  ownerDisplayName,
  busy,
}: {
  subscription: {
    uri: string;
    amount: number;
    interval: string;
    billingStartDate: string;
  };
  ownerDisplayName: string;
  busy: boolean;
}) {
  const renewsOn = nextRenewalDate(
    subscription.billingStartDate,
    subscription.interval,
  );
  return (
    <Card title="Your subscription">
      <p className="mb-3 text-sm text-text">
        You&apos;re subscribed to <strong>{ownerDisplayName}</strong>
      </p>
      <p className="mb-3 text-text-muted">
        ${centsToDollars(subscription.amount)}/
        {subscription.interval === "yearly" ? "year" : "month"} ·{" "}
        <span className="text-green-600 dark:text-green-400">active</span>
      </p>
      <p className="mb-3 text-sm text-text-muted">
        Renews on{" "}
        {renewsOn.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </p>
      <Form method="post">
        <input type="hidden" name="intent" value="cancel" />
        <input type="hidden" name="subscriptionUri" value={subscription.uri} />
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
  );
}

const DAY_MS = 86_400_000;

function nextRenewalDate(billingStartDate: string, interval: string): Date {
  const intervalDays = interval === "yearly" ? 365 : 30;
  const startMs = new Date(billingStartDate).getTime();
  const nowMs = Date.now();
  const daysSince = Math.floor((nowMs - startMs) / DAY_MS);
  const daysIntoPeriod = daysSince % intervalDays;
  return new Date(nowMs + (intervalDays - daysIntoPeriod) * DAY_MS);
}

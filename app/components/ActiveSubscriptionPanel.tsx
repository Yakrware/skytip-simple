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
  };
  ownerDisplayName: string;
  busy: boolean;
}) {
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

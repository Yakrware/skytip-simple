import { Form } from "react-router";
import { centsToDollars } from "~/lib/currency";
import { AmountInput } from "./AmountInput";
import { Button } from "./Button";
import { Card } from "./Card";

export function SubscribePanel({
  minSubscriptionAmount,
  maxSubscriptionAmount,
  busy,
}: {
  minSubscriptionAmount?: number;
  maxSubscriptionAmount?: number;
  busy: boolean;
}) {
  const defaultAmount = minSubscriptionAmount ?? 100;
  return (
    <Card title="Subscribe">
      <Form method="post" className="space-y-3">
        <input type="hidden" name="intent" value="subscribe" />
        <input type="hidden" name="interval" value="monthly" />

        <AmountInput
          name="amount"
          label="Monthly amount"
          min={minSubscriptionAmount}
          max={maxSubscriptionAmount}
          defaultValue={defaultAmount}
        />

        <Button type="submit" disabled={busy} loading={busy}>
          Subscribe ${centsToDollars(defaultAmount)}/mo
        </Button>
      </Form>
    </Card>
  );
}

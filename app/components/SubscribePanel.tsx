import { Form } from "react-router";
import { centsToDollars } from "~/lib/currency";
import { AmountInput } from "./AmountInput";
import { Button } from "./Button";
import { Card } from "./Card";

export function SubscribePanel({
  minSubscriptionAmount,
  maxSubscriptionAmount,
  alwaysPrivate,
  busy,
}: {
  minSubscriptionAmount?: number;
  maxSubscriptionAmount?: number;
  alwaysPrivate?: boolean;
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

        {alwaysPrivate ? (
          <input type="hidden" name="isPrivate" value="true" />
        ) : (
          <label className="flex items-start gap-2 text-sm text-text">
            <input
              type="checkbox"
              name="isPrivate"
              value="true"
              className="mt-0.5 h-4 w-4 rounded border-border text-brand focus:ring-brand"
            />
            <span>
              Subscribe privately
              <span className="block text-xs text-text-muted">
                Hide the recipient from my public record. Increases privacy,
                reduces transferability.
              </span>
            </span>
          </label>
        )}

        <Button type="submit" disabled={busy} loading={busy}>
          Subscribe ${centsToDollars(defaultAmount)}/mo
        </Button>
      </Form>
    </Card>
  );
}

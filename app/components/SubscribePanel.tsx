import { Form } from "react-router";
import { centsToDollars } from "~/lib/currency";
import { AmountPicker } from "./AmountPicker";
import { Button } from "./Button";
import { Card } from "./Card";
import { ChatReceiptCheckbox } from "./ChatReceiptCheckbox";
import { PrivacyCheckbox } from "./PrivacyCheckbox";

export function SubscribePanel({
  minSubscriptionAmount,
  maxSubscriptionAmount,
  suggestedSubscriptionAmount,
  subscriptionAmountOptions,
  alwaysPrivate,
  busy,
}: {
  minSubscriptionAmount?: number;
  maxSubscriptionAmount?: number;
  suggestedSubscriptionAmount?: number;
  subscriptionAmountOptions?: number[];
  alwaysPrivate?: boolean;
  busy: boolean;
}) {
  const defaultAmount =
    suggestedSubscriptionAmount ?? minSubscriptionAmount ?? 100;

  return (
    <Card title="Subscribe">
      <Form method="post" className="space-y-3">
        <input type="hidden" name="intent" value="subscribe" />
        <input type="hidden" name="interval" value="monthly" />

        <AmountPicker
          label="Monthly amount"
          min={minSubscriptionAmount}
          max={maxSubscriptionAmount}
          suggested={suggestedSubscriptionAmount}
          options={subscriptionAmountOptions}
        />

        <PrivacyCheckbox
          alwaysPrivate={alwaysPrivate}
          label="Subscribe privately"
        />
        <ChatReceiptCheckbox />

        <Button type="submit" disabled={busy} loading={busy}>
          Subscribe ${centsToDollars(defaultAmount)}/mo
        </Button>
      </Form>
    </Card>
  );
}

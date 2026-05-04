import { Form } from "react-router";
import { AmountPicker } from "./AmountPicker";
import { Button } from "./Button";
import { Card } from "./Card";
import { ChatReceiptCheckbox } from "./ChatReceiptCheckbox";
import { PrivacyCheckbox } from "./PrivacyCheckbox";

export function TipPanel({
  minTipAmount,
  maxTipAmount,
  suggestedTipAmount,
  tipAmountOptions,
  alwaysPrivate,
  busy,
}: {
  minTipAmount?: number;
  maxTipAmount?: number;
  suggestedTipAmount?: number;
  tipAmountOptions?: number[];
  alwaysPrivate?: boolean;
  busy: boolean;
}) {
  return (
    <Card title="Send a tip">
      <Form method="post" className="space-y-3">
        <input type="hidden" name="intent" value="tip" />

        <AmountPicker
          label="Amount"
          min={minTipAmount}
          max={maxTipAmount}
          suggested={suggestedTipAmount}
          options={tipAmountOptions}
        />

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

        <PrivacyCheckbox alwaysPrivate={alwaysPrivate} label="Send privately" />
        <ChatReceiptCheckbox />

        <Button type="submit" disabled={busy} loading={busy}>
          Send tip
        </Button>
      </Form>
    </Card>
  );
}

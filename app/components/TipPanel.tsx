import { Form } from "react-router";
import { centsToDollars } from "~/lib/currency";
import { AmountInput } from "./AmountInput";
import { Button } from "./Button";
import { Card } from "./Card";

export function TipPanel({
  minTipAmount,
  maxTipAmount,
  suggestedTipAmount,
  alwaysPrivate,
  busy,
}: {
  minTipAmount?: number;
  maxTipAmount?: number;
  suggestedTipAmount?: number;
  alwaysPrivate?: boolean;
  busy: boolean;
}) {
  const defaultTipAmount = suggestedTipAmount ?? minTipAmount ?? 100;
  const quickAmounts = [
    minTipAmount ?? 100,
    defaultTipAmount,
    maxTipAmount
      ? Math.min(defaultTipAmount * 2, maxTipAmount)
      : defaultTipAmount * 2,
  ];
  const uniqueQuickAmounts = [...new Set(quickAmounts)];

  return (
    <Card title="Send a tip">
      <Form method="post" className="space-y-3">
        <input type="hidden" name="intent" value="tip" />

        <AmountInput
          name="amount"
          label="Amount"
          min={minTipAmount}
          max={maxTipAmount}
          defaultValue={defaultTipAmount}
        />

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
              Send privately
              <span className="block text-xs text-text-muted">
                Hide the recipient from my public record. Increases privacy,
                reduces transferability.
              </span>
            </span>
          </label>
        )}

        <Button type="submit" disabled={busy} loading={busy}>
          Send tip
        </Button>
      </Form>
    </Card>
  );
}

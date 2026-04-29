import { centsToDollars } from "~/lib/currency";
import { AmountInput } from "./AmountInput";

export function AmountPicker({
  label,
  min,
  max,
  suggested,
  options,
}: {
  label: string;
  min?: number;
  max?: number;
  suggested?: number;
  options?: number[];
}) {
  const defaultAmount = suggested ?? min ?? 100;
  const fallbackOptions = [
    min ?? 100,
    defaultAmount,
    max ? Math.min(defaultAmount * 2, max) : defaultAmount * 2,
  ];
  const sourceOptions =
    options && options.length > 0 ? options : fallbackOptions;
  const quickAmounts = [...new Set(sourceOptions)].sort((a, b) => a - b);

  return (
    <>
      <AmountInput
        name="amount"
        label={label}
        min={min}
        max={max}
        defaultValue={defaultAmount}
      />
      <div className="flex flex-wrap gap-2">
        {quickAmounts.map((cents) => (
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
    </>
  );
}

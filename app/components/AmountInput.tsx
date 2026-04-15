export function AmountInput({
  name,
  min,
  max,
  defaultValue,
  label,
}: {
  name: string;
  min?: number;
  max?: number;
  defaultValue?: number;
  label?: string;
}) {
  const id = `amount-${name}`;

  return (
    <div>
      {label && (
        <label htmlFor={id} className="mb-1 block text-sm font-medium text-text">
          {label}
        </label>
      )}
      <div className="relative">
        <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-text-muted">
          $
        </span>
        <input
          id={id}
          name={name}
          type="number"
          step="0.01"
          min={min != null ? min / 100 : undefined}
          max={max != null ? max / 100 : undefined}
          defaultValue={defaultValue != null ? (defaultValue / 100).toFixed(2) : undefined}
          className="w-full rounded-lg border border-border bg-surface-subtle py-2 pr-3 pl-7 text-text focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none"
        />
      </div>
    </div>
  );
}

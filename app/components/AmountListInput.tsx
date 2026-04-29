import { useState } from "react";

export function AmountListInput({
  name,
  label,
  defaultValues,
}: {
  name: string;
  label: string;
  defaultValues?: number[];
}) {
  const [rows, setRows] = useState<{ id: number; value: string }[]>(() =>
    (defaultValues ?? []).map((cents, i) => ({
      id: i,
      value: (cents / 100).toFixed(2),
    })),
  );
  const [nextId, setNextId] = useState(rows.length);

  function add() {
    setRows([...rows, { id: nextId, value: "" }]);
    setNextId(nextId + 1);
  }

  function update(id: number, value: string) {
    setRows(rows.map((r) => (r.id === id ? { ...r, value } : r)));
  }

  function remove(id: number) {
    setRows(rows.filter((r) => r.id !== id));
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-text">{label}</label>
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.id} className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-text-muted">
                $
              </span>
              <input
                name={name}
                type="number"
                step="0.01"
                min="1.00"
                value={row.value}
                onChange={(e) => update(row.id, e.target.value)}
                className="w-full rounded-lg border border-border bg-surface-subtle py-2 pr-3 pl-7 text-text focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => remove(row.id)}
              className="rounded-lg border border-border px-3 py-2 text-sm text-text-muted hover:bg-surface-subtle"
              aria-label="Remove amount"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className="rounded-lg border border-border px-3 py-1 text-sm text-text hover:bg-surface-subtle"
      >
        + Add option
      </button>
    </div>
  );
}

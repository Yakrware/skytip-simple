export function dollarsToCents(value: FormDataEntryValue | null): number {
  const n = parseFloat(String(value ?? "0"));
  if (Number.isNaN(n)) return 0;
  return Math.round(n * 100);
}

export function optionalDollarsToCents(
  value: FormDataEntryValue | null,
): number | undefined {
  if (value == null || String(value).trim() === "") return undefined;
  return dollarsToCents(value);
}

export function centsToDollars(cents: number): string {
  return (cents / 100).toFixed(2);
}

// Client-safe currency helpers. Server-only variants (dollarsToCents,
// optionalDollarsToCents) live in owner.server.ts so they stay out of
// client bundles.
export function centsToDollars(cents: number): string {
  return (cents / 100).toFixed(2);
}

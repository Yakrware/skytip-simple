import { centsToDollars } from "~/lib/currency";
import { Card } from "./Card";

export type TipHistoryEntry = {
  uri: string;
  amount: number;
  currency: string;
  status: "pending" | "authorized" | "completed" | "failed" | "refunded";
  message?: string;
  createdAt: string;
};

const STATUS_LABEL: Record<TipHistoryEntry["status"], string> = {
  pending: "Pending",
  authorized: "Authorized",
  completed: "Completed",
  failed: "Failed",
  refunded: "Refunded",
};

const STATUS_TONE: Record<TipHistoryEntry["status"], string> = {
  pending: "text-text-muted",
  authorized: "text-text-muted",
  completed: "text-green-600 dark:text-green-400",
  failed: "text-red-600 dark:text-red-400",
  refunded: "text-amber-600 dark:text-amber-400",
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function TipHistoryPanel({
  tips,
  recipientHandle,
}: {
  tips: TipHistoryEntry[];
  recipientHandle: string;
}) {
  const title = `Tips sent to @${recipientHandle}`;
  if (tips.length === 0) {
    return (
      <Card title={title}>
        <p className="text-sm text-text-muted">
          You haven&apos;t sent any tips yet.
        </p>
      </Card>
    );
  }

  return (
    <Card title={title}>
      <ul className="divide-y divide-border">
        {tips.map((tip) => (
          <li key={tip.uri} className="py-3 first:pt-0 last:pb-0">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-medium text-text">
                ${centsToDollars(tip.amount)}
              </span>
              <span className="text-xs text-text-muted">
                {formatDate(tip.createdAt)}
              </span>
            </div>
            {tip.message && (
              <p className="mt-1 text-sm text-text-muted">{tip.message}</p>
            )}
            <span className={`mt-1 block text-xs ${STATUS_TONE[tip.status]}`}>
              {STATUS_LABEL[tip.status]}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

import type { ReactNode } from "react";

export function Card({
  children,
  title,
  className = "",
}: {
  children: ReactNode;
  title?: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-border bg-surface p-4 shadow-sm ${className}`}
    >
      {title && (
        <h2 className="mb-3 text-lg font-semibold text-text">{title}</h2>
      )}
      {children}
    </div>
  );
}

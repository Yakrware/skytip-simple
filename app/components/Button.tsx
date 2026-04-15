import type { ButtonHTMLAttributes } from "react";

const VARIANTS = {
  primary:
    "bg-brand text-white hover:bg-brand-hover focus-visible:ring-brand/50",
  secondary:
    "border border-border text-text hover:bg-surface-subtle focus-visible:ring-brand/50",
  ghost:
    "text-text hover:bg-surface-subtle focus-visible:ring-brand/50",
} as const;

export function Button({
  variant = "primary",
  loading = false,
  className = "",
  disabled,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
}) {
  return (
    <button
      className={`inline-flex cursor-pointer items-center justify-center rounded-lg px-4 py-2 font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && (
        <svg
          className="mr-2 -ml-1 h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}

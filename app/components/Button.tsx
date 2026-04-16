import type { ButtonHTMLAttributes } from "react";
import spinnerUrl from "~/icons/spinner.svg";

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
        <img
          src={spinnerUrl}
          className="mr-2 -ml-1 h-4 w-4 animate-spin"
          aria-hidden="true"
          alt=""
        />
      )}
      {children}
    </button>
  );
}

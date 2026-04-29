export function PrivacyCheckbox({
  alwaysPrivate,
  label,
}: {
  alwaysPrivate?: boolean;
  label: string;
}) {
  if (alwaysPrivate) {
    return <input type="hidden" name="isPrivate" value="true" />;
  }
  return (
    <label className="flex items-start gap-2 text-sm text-text">
      <input
        type="checkbox"
        name="isPrivate"
        value="true"
        className="mt-0.5 h-4 w-4 rounded border-border text-brand focus:ring-brand"
      />
      <span>
        {label}
        <span className="block text-xs text-text-muted">
          Hide the recipient from my public record. Increases privacy, reduces
          transferability.
        </span>
      </span>
    </label>
  );
}

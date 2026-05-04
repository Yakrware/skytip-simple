export function ChatReceiptCheckbox() {
  return (
    <label className="flex items-start gap-2 text-sm text-text">
      <input
        type="checkbox"
        name="sendChatReceipt"
        value="true"
        defaultChecked
        className="mt-0.5 h-4 w-4 rounded border-border text-brand focus:ring-brand"
      />
      <span>Send receipt via Bluesky chat</span>
    </label>
  );
}

import { Form, useActionData, useNavigation } from "react-router";
import { Button } from "./Button";
import { ErrorBanner } from "./ErrorBanner";

export function LoginForm() {
  const actionData = useActionData<{ error?: string }>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <Form method="post" action="/oauth/atproto/login" className="space-y-4">
      <div>
        <label
          htmlFor="handle"
          className="mb-1 block text-sm font-medium text-text"
        >
          Your Bluesky handle
        </label>
        <input
          id="handle"
          name="handle"
          type="text"
          placeholder="yourname.bsky.social"
          required
          autoComplete="username"
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-text placeholder:text-text-muted focus:border-brand focus:ring-2 focus:ring-brand/50 focus:outline-none"
        />
      </div>

      {actionData?.error && <ErrorBanner message={actionData.error} />}

      <Button type="submit" loading={isSubmitting} className="w-full">
        Sign in with Bluesky
      </Button>
    </Form>
  );
}

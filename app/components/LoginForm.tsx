import { Form, useActionData, useNavigation } from "react-router";
import { Button } from "./Button";
import { ErrorBanner } from "./ErrorBanner";

export function LoginForm() {
  const actionData = useActionData<{ error?: string }>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="space-y-4">
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
            autoComplete="username"
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-text placeholder:text-text-muted focus:border-brand focus:ring-2 focus:ring-brand/50 focus:outline-none"
          />
        </div>

        {actionData?.error && <ErrorBanner message={actionData.error} />}

        <Button
          type="submit"
          name="intent"
          value="login"
          loading={isSubmitting}
          className="w-full"
        >
          Sign in with Bluesky
        </Button>
      </Form>

      <div className="flex items-center gap-3">
        <hr className="flex-1 border-border" />
        <span className="text-sm text-text-muted">or</span>
        <hr className="flex-1 border-border" />
      </div>

      <Form method="post" action="/oauth/atproto/login">
        <Button
          type="submit"
          name="intent"
          value="create"
          variant="secondary"
          loading={isSubmitting}
          className="w-full"
        >
          Create a Bluesky account
        </Button>
      </Form>
    </div>
  );
}

import type {
  ActionFunctionArgs,
  AppLoadContext,
  EntryContext,
  LoaderFunctionArgs,
} from "react-router";
import { isRouteErrorResponse, ServerRouter } from "react-router";
import { isbot } from "isbot";
import { renderToReadableStream } from "react-dom/server";

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  _loadContext: AppLoadContext,
) {
  let shellRendered = false;
  const userAgent = request.headers.get("user-agent");

  const body = await renderToReadableStream(
    <ServerRouter context={routerContext} url={request.url} />,
    {
      onError(error: unknown) {
        responseStatusCode = 500;
        // Log streaming rendering errors from inside the shell.  Don't log
        // errors encountered during initial shell rendering since they'll
        // reject and get logged in handleDocumentRequest.
        if (shellRendered) {
          logServerError(error, "[render]", new URL(request.url).pathname);
        }
      },
    },
  );
  shellRendered = true;

  // Ensure requests from bots and SPA Mode renders wait for all content to load before responding
  // https://react.dev/reference/react-dom/server/renderToPipeableStream#waiting-for-all-content-to-load-for-crawlers-and-static-generation
  if ((userAgent && isbot(userAgent)) || routerContext.isSpaMode) {
    await body.allReady;
  }

  responseHeaders.set("Content-Type", "text/html");
  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}

export function handleError(
  error: unknown,
  {
    request,
  }: {
    request: LoaderFunctionArgs["request"] | ActionFunctionArgs["request"];
    context: LoaderFunctionArgs["context"] | ActionFunctionArgs["context"];
    params: LoaderFunctionArgs["params"] | ActionFunctionArgs["params"];
  },
) {
  if (request.signal.aborted) return;
  // Unwrap react-router's ErrorResponseImpl so we log the underlying error,
  // not its sanitized stub.
  const unwrapped = isRouteErrorResponse(error)
    ? ((error as unknown as { error?: unknown }).error ?? error)
    : error;
  logServerError(unwrapped, "[handleError]", new URL(request.url).pathname);
}

function logServerError(error: unknown, tag: string, path: string) {
  if (error instanceof Error) {
    const topFrame = error.stack
      ?.split("\n")
      .slice(1)
      .find((line) => line.trim().startsWith("at"))
      ?.trim();
    console.error(`${tag} ${path} ${error.message} ${topFrame ?? ""}`.trim());
    if (
      typeof (error as { status?: unknown }).status === "number" &&
      typeof (error as { error?: unknown }).error === "string"
    ) {
      const xrpc = error as Error & {
        status: number;
        error: string;
        headers?: Record<string, string>;
      };
      console.error(
        `${tag} XRPC status=${xrpc.status} code=${xrpc.error} headers=${formatValue(xrpc.headers)}`,
      );
    }
    if ("lexiconNsid" in error && "validationError" in error) {
      const xrpc = error as Error & {
        lexiconNsid?: string;
        validationError?: unknown;
        responseBody?: unknown;
      };
      console.error(
        `${tag} XRPC invalid response nsid=${xrpc.lexiconNsid} validation=${formatValue(xrpc.validationError)} body=${formatValue(xrpc.responseBody)}`,
      );
    }
    if (error.cause) {
      console.error(`${tag} cause: ${formatValue(error.cause)}`);
    }
  } else {
    console.error(`${tag} ${path}`, error);
  }
}

function formatValue(v: unknown): string {
  if (v == null) return String(v);
  if (typeof v === "string") return v;
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

import {
  patchGlobalRequestObject,
  EdgeOAuthClient,
  type EdgeOAuthClientOptions,
} from "@atiproto/edge-oauth-client";
import { KvStateStore, KvSessionStore } from "@atiproto/kv-oauth-state-store";
import {
  createDidCache,
  createHandleCache,
} from "@atiproto/edge-resolver-cache";

patchGlobalRequestObject();

export const OAUTH_SCOPE_OWNER =
  "atproto include:com.atiproto.authEnhanced";
export const OAUTH_SCOPE_VISITOR = "atproto include:com.atiproto.authGeneral";

export function buildClientMetadata(origin: string, ownerHandle: string) {
  return {
    client_id: `${origin}/oauth/atproto/client-metadata.json`,
    client_name: `@${ownerHandle}'s skytip`,
    redirect_uris: [`${origin}/oauth/atproto/callback`],
    grant_types: ["authorization_code", "refresh_token"],
    response_types: ["code"],
    scope: OAUTH_SCOPE_VISITOR,
    token_endpoint_auth_method: "none",
    dpop_bound_access_tokens: true,
    application_type: "web",
  };
}

export function createOAuthClient(
  origin: string,
  kv: KVNamespace,
  ownerHandle: string,
): EdgeOAuthClient {
  return new EdgeOAuthClient({
    clientMetadata: buildClientMetadata(
      origin,
      ownerHandle,
    ) as EdgeOAuthClientOptions["clientMetadata"],
    stateStore: new KvStateStore(kv),
    sessionStore: new KvSessionStore(kv),
    didCache: createDidCache(),
    handleCache: createHandleCache(),
  });
}

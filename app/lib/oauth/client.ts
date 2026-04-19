import {
  patchGlobalRequestObject,
  EdgeOAuthClient,
  type EdgeOAuthClientOptions,
  getKeyset,
} from "@atiproto/edge-oauth-client";
import { KvStateStore, KvSessionStore } from "@atiproto/kv-oauth-state-store";
import {
  createDidCache,
  createHandleCache,
} from "@atiproto/edge-resolver-cache";
import type { Keyset } from "@atproto/jwk";

patchGlobalRequestObject();

export const OAUTH_SCOPE_OWNER = "atproto include:com.atiproto.authEnhanced";
export const OAUTH_SCOPE_VISITOR = "atproto include:com.atiproto.authGeneral";

export function buildClientMetadata(
  origin: string,
  ownerHandle: string,
  isOwner: boolean,
  keyset: Keyset | null,
) {
  const base = {
    client_id: `${origin}/oauth/atproto/client-metadata.json${isOwner ? "?owner=true" : ""}`,
    client_name: `@${ownerHandle}'s skytip`,
    redirect_uris: [`${origin}/oauth/atproto/callback`],
    grant_types: ["authorization_code", "refresh_token"],
    response_types: ["code"],
    scope: isOwner ? OAUTH_SCOPE_OWNER : OAUTH_SCOPE_VISITOR,
    dpop_bound_access_tokens: true,
    application_type: "web",
  };
  if (keyset) {
    return {
      ...base,
      token_endpoint_auth_method: "private_key_jwt",
      token_endpoint_auth_signing_alg: "ES256",
      jwks: keyset.publicJwks,
    };
  }
  return {
    ...base,
    token_endpoint_auth_method: "none",
  };
}

export async function createOAuthClient(
  origin: string,
  env: Env,
  isOwner: boolean,
): Promise<EdgeOAuthClient> {
  const keyset = await getKeyset(env.OAUTH_PRIVATE_JWK);
  return new EdgeOAuthClient({
    clientMetadata: buildClientMetadata(
      origin,
      env.OWNER_HANDLE,
      isOwner,
      keyset,
    ) as EdgeOAuthClientOptions["clientMetadata"],
    stateStore: new KvStateStore(env.OAUTH_KV),
    sessionStore: new KvSessionStore(env.OAUTH_KV),
    didCache: createDidCache(),
    handleCache: createHandleCache(),
    keyset: keyset ?? undefined,
  });
}

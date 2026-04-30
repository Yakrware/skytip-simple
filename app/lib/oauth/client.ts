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

const ATIPROTO_AUD = "*";

const OWNER_REPO_COLLECTIONS = [
  "com.atiproto.profile",
  "skytip.simple.settings",
];

const OWNER_RPC_LXMS = [
  "com.atiproto.recipient.profile.get",
  "com.atiproto.recipient.profile.put",
];

const VISITOR_REPO_COLLECTIONS = [
  "com.atiproto.cart",
  "com.atiproto.item",
  "com.atiproto.subscription",
];

const VISITOR_RPC_LXMS = [
  "com.atiproto.repo.profile.get",
  "com.atiproto.payment.item.create",
  "com.atiproto.payment.item.list",
  "com.atiproto.payment.subscription.create",
  "com.atiproto.payment.subscription.get",
  "com.atiproto.payment.subscription.cancel",
];

function buildScope(collections: string[], lxms: string[]): string {
  return [
    "atproto",
    ...collections.map((c) => `repo:${c}`),
    ...lxms.map((lxm) => `rpc:${lxm}?aud=${ATIPROTO_AUD}`),
  ].join(" ");
}

export const OAUTH_SCOPE_OWNER = buildScope(
  OWNER_REPO_COLLECTIONS,
  OWNER_RPC_LXMS,
);
export const OAUTH_SCOPE_VISITOR = buildScope(
  VISITOR_REPO_COLLECTIONS,
  VISITOR_RPC_LXMS,
);

export function buildClientMetadata(
  origin: string,
  ownerHandle: string,
  isOwner: boolean,
  keyset: Keyset | null,
) {
  const base = {
    client_id: `${origin}/oauth/atproto/${isOwner ? "owner-metadata" : "client-metadata"}.json`,
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

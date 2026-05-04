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
const BSKY_CHAT_AUD = "*";

type Rpc = { lxm: string; aud: string };

const CHAT_RPCS: Rpc[] = [
  { lxm: "chat.bsky.convo.getConvoForMembers", aud: BSKY_CHAT_AUD },
  { lxm: "chat.bsky.convo.getConvoAvailability", aud: BSKY_CHAT_AUD },
  { lxm: "chat.bsky.convo.acceptConvo", aud: BSKY_CHAT_AUD },
];

const OWNER_REPO_COLLECTIONS = [
  "com.atiproto.profile",
  "skytip.simple.settings",
];

const OWNER_RPCS: Rpc[] = [
  { lxm: "com.atiproto.recipient.profile.get", aud: ATIPROTO_AUD },
  { lxm: "com.atiproto.recipient.profile.put", aud: ATIPROTO_AUD },
  ...CHAT_RPCS,
];

const VISITOR_REPO_COLLECTIONS = [
  "com.atiproto.cart",
  "com.atiproto.item",
  "com.atiproto.subscription",
];

const VISITOR_RPCS: Rpc[] = [
  { lxm: "com.atiproto.repo.profile.get", aud: ATIPROTO_AUD },
  { lxm: "com.atiproto.payment.item.create", aud: ATIPROTO_AUD },
  { lxm: "com.atiproto.payment.item.list", aud: ATIPROTO_AUD },
  { lxm: "com.atiproto.payment.subscription.create", aud: ATIPROTO_AUD },
  { lxm: "com.atiproto.payment.subscription.get", aud: ATIPROTO_AUD },
  { lxm: "com.atiproto.payment.subscription.cancel", aud: ATIPROTO_AUD },
  ...CHAT_RPCS,
];

function buildScope(collections: string[], rpcs: Rpc[]): string {
  return [
    "atproto",
    ...collections.map((c) => `repo:${c}`),
    ...rpcs.map(({ lxm, aud }) => `rpc:${lxm}?aud=${encodeURIComponent(aud)}`),
  ].join(" ");
}

export const OAUTH_SCOPE_OWNER = buildScope(OWNER_REPO_COLLECTIONS, OWNER_RPCS);
export const OAUTH_SCOPE_VISITOR = buildScope(
  VISITOR_REPO_COLLECTIONS,
  VISITOR_RPCS,
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

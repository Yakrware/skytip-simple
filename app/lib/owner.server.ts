import {
  EdgeXrpcHandleResolver,
  EdgeDidResolver,
} from "@atiproto/edge-resolvers";
import { Agent } from "@atproto/api";
import type { Main as SkytipSettings } from "~/lexicons/skytip/simple/settings";

export type DidString = `did:${string}:${string}`;

const handleResolver = new EdgeXrpcHandleResolver();
const didResolver = new EdgeDidResolver();

export async function resolveOwner(env: Env): Promise<DidString> {
  const raw = env.OWNER_HANDLE.trim();
  if (raw.startsWith("did:")) return raw as DidString;
  const did = await handleResolver.resolve(raw);
  if (!did) throw new Error(`Could not resolve OWNER_HANDLE: ${raw}`);
  return did as DidString;
}

export async function resolveOwnerPds(did: string): Promise<string> {
  const doc = await didResolver.resolve(did);
  const pds = doc?.service?.find(
    (s: { id: string }) => s.id === "#atproto_pds",
  );
  if (!pds) throw new Error(`No PDS found for ${did}`);
  return pds.serviceEndpoint as string;
}

export async function loadOwnerSettings(
  did: string,
  pdsUrl: string,
): Promise<Partial<SkytipSettings> | null> {
  const agent = new Agent(pdsUrl);
  try {
    const { data } = await agent.com.atproto.repo.getRecord({
      repo: did,
      collection: "skytip.simple.settings",
      rkey: "self",
    });
    return data.value as Partial<SkytipSettings>;
  } catch {
    return null;
  }
}

export function applyDefaults(
  settings: Partial<SkytipSettings>,
): SkytipSettings {
  return {
    $type: "skytip.simple.settings",
    minTipAmount: 100,
    minSubscriptionAmount: 100,
    currency: "USD",
    ...settings,
  };
}

export async function fetchOwnerBskyProfile(ownerDid: string) {
  const agent = new Agent("https://public.api.bsky.app");
  const { data } = await agent.app.bsky.actor.getProfile({
    actor: ownerDid,
  });
  return {
    displayName: data.displayName ?? data.handle,
    handle: data.handle,
    avatar: data.avatar,
    description: data.description,
  };
}

export function dollarsToCents(value: FormDataEntryValue | null): number {
  const num = parseFloat(String(value ?? "0"));
  return Math.round(num * 100);
}

export function optionalDollarsToCents(
  value: FormDataEntryValue | null,
): number | undefined {
  const str = String(value ?? "").trim();
  if (!str) return undefined;
  const num = parseFloat(str);
  if (isNaN(num)) return undefined;
  return Math.round(num * 100);
}

export function centsToDollars(cents: number): string {
  return (cents / 100).toFixed(2);
}

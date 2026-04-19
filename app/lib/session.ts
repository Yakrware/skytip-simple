const COOKIE_NAME = "sid";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function parseCookie(header: string): Record<string, string> {
  return Object.fromEntries(
    header.split(";").map((s) => {
      const idx = s.indexOf("=");
      if (idx === -1) return [s.trim(), ""];
      return [
        decodeURIComponent(s.slice(0, idx).trim()),
        decodeURIComponent(s.slice(idx + 1).trim()),
      ];
    }),
  );
}

export function parseSessionValue(
  raw: string | undefined,
): { did: string; handle?: string } | null {
  if (!raw) return null;
  const [did, handle] = raw.split("|");
  if (!did) return null;
  return { did, handle: handle || undefined };
}

export function sessionCookieHeader(did: string, handle: string): string {
  const value = `${did}|${handle}`;
  return `${COOKIE_NAME}=${encodeURIComponent(value)}; HttpOnly; SameSite=Lax; Secure; Max-Age=${MAX_AGE}; Path=/`;
}

export function clearSessionCookieHeader(): string {
  return `${COOKIE_NAME}=; HttpOnly; SameSite=Lax; Secure; Max-Age=0; Path=/`;
}

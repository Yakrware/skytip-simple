import { parseCookie } from "./session";

export async function getOptionalSession(request: Request, _kv: KVNamespace) {
  const cookies = parseCookie(request.headers.get("Cookie") ?? "");
  const did = cookies["sid"];
  if (!did) return null;
  return { did };
}

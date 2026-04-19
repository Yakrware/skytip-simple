import { parseCookie, parseSessionValue } from "./session";

export async function getSession(request: Request, _kv: KVNamespace) {
  const cookies = parseCookie(request.headers.get("Cookie") ?? "");
  return parseSessionValue(cookies["sid"]);
}

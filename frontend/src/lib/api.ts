export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000")
  .replace(/\/+$/, "")
  .replace(/\/api(?:\/v1)?$/, "");

/** Attach credentials at call time, including during child components' first effects. */
export function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = new URL(input instanceof Request ? input.url : String(input), `${API_URL}/`);
  const base = new URL(`${API_URL}/`);
  const isApi = url.origin === base.origin && url.pathname.startsWith(`${base.pathname}api/`);
  if (!isApi) return fetch(input, init);

  const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
  if (typeof window !== "undefined" && !headers.has("Authorization")) {
    try {
      const token = window.localStorage.getItem("token");
      if (token) headers.set("Authorization", `Bearer ${token}`);
    } catch {
      // Cookie authentication remains available when browser storage is disabled.
    }
  }
  return fetch(input, { credentials: "include", ...init, headers });
}

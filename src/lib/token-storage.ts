/**
 * Access token: kept in memory only (module-level variable) — never
 * localStorage, since anything JS-readable is XSS-exposed. It naturally
 * clears on full page reload, at which point `refreshAccessToken()` (via
 * the httpOnly refresh cookie) re-establishes the session.
 *
 * Refresh token: the Django backend should set this as an httpOnly,
 * Secure, SameSite=Lax cookie on login (see backend note in README) so
 * client-side JS can never read it. This client sends
 * `withCredentials: true` so the browser attaches it automatically.
 *
 * If your deployment can't add the httpOnly-cookie endpoint yet, the
 * fallback in `refreshAccessToken()` below also accepts a refresh token
 * returned in the JSON body — but treat that as a stepping stone, not
 * the end state, since a JSON-body refresh token IS readable by any
 * script on the page.
 */
let accessToken: string | null = null;

export const TokenStore = {
  getAccess: () => accessToken,
  setAccess: (token: string | null) => {
    accessToken = token;
  },
  clear: () => {
    accessToken = null;
  },
};

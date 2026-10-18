/**
 * Where to send the user after signing in. The `auth` route middleware
 * appends ?redirect=<intended path> when it bounces a guest to /login.
 * Accepts only same-site absolute paths (not "//evil.com" or a full URL)
 * so it can't be turned into an open redirect: one leading "/", then no
 * "/" or "\\" (browsers read "/\\evil.example" as "//evil.example") and no
 * whitespace/control characters anywhere.
 */
export function safeRedirectPath(raw: unknown): string {
  const path = typeof raw === 'string' ? raw : ''
  return /^\/(?![\/\\])[^\\\s\u0000-\u001f]*$/.test(path) ? path : '/'
}

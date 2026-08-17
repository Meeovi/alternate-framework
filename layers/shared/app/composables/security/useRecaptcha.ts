// useScriptGoogleRecaptcha() must be called inside a component/composable
// setup context, not at module scope — module top-level code runs once per
// server process (not per-request), so calling it here would either throw
// (no active Nuxt instance at import time) or silently share state across
// unrelated requests.
export function useRecaptcha() {
  const { proxy } = useScriptGoogleRecaptcha()

  return async (siteKey: string, action: string = 'submit') => {
    const token = await proxy.grecaptcha.execute(siteKey, { action })
    return token
  }
}
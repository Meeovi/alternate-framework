const { proxy } = useScriptGoogleRecaptcha()

export function useRecaptcha() {
  return async (siteKey: string, action: string = 'submit') => {
    const token = await proxy.grecaptcha.execute(siteKey, { action })
    return token
  }
}
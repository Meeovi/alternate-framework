const { proxy } = useScriptGoogleRecaptcha()

const token = await proxy.grecaptcha.execute(siteKey, { action: 'submit' })
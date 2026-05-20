import { createError, type H3Event, getCookie, setCookie, deleteCookie } from 'h3'

type AdapterName = string

type AdapterAuthUser = {
  id: string
  email?: string | null
  name?: string | null
  role?: string | null
  [key: string]: unknown
}

type AdapterAuthResult = {
  token: string
  user: AdapterAuthUser
}

type AdapterSession = {
  session: {
    token: string
  }
  user: AdapterAuthUser
}

type AdapterSignInPayload = {
  email?: string
  password?: string
  rememberMe?: boolean
}

type AdapterSignUpPayload = {
  email?: string
  password?: string
  name?: string
}

type AdapterProvider = {
  name: string
  signIn: (payload: AdapterSignInPayload) => Promise<AdapterAuthResult>
  signUp: (payload: AdapterSignUpPayload) => Promise<AdapterAuthResult>
  getSession: (token: string) => Promise<AdapterAuthUser | null>
  signOut?: (token: string) => Promise<void>
}

type AdapterRegistrar = () => void | Promise<void>

const providerRegistry = new Map<string, AdapterProvider>()
const registrarRegistry: AdapterRegistrar[] = []
let registrarsLoaded = false

const normalizeAdapterName = (name: string) => name.trim().toLowerCase()

const ensureNonEmptyCredentials = (payload: { email?: string; password?: string }) => {
  const email = String(payload?.email || '').trim()
  const password = String(payload?.password || '')
  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'email and password are required' })
  }
  return { email, password }
}

const registerAdapter = (provider: AdapterProvider) => {
  const key = normalizeAdapterName(provider.name)
  providerRegistry.set(key, { ...provider, name: key })
}

export const registerAuthAdapter = (provider: AdapterProvider) => {
  registerAdapter(provider)
}

export const registerAuthAdapterRegistrar = (registrar: AdapterRegistrar) => {
  registrarRegistry.push(registrar)
}

const ensureRegistrarsLoaded = async () => {
  if (registrarsLoaded) return
  registrarsLoaded = true
  for (const registrar of registrarRegistry) {
    await registrar()
  }
}

const getAvailableAdapters = () => Array.from(providerRegistry.keys())

const configuredAdapterFromEnv = () =>
  normalizeAdapterName(process.env.AUTH_ADAPTER || process.env.NUXT_PUBLIC_AUTH_BACKEND || '')

const runtimeAdapter = (): AdapterName => {
  const raw = configuredAdapterFromEnv()
  if (raw) return raw
  return process.env.MAGE_STORE_URL || process.env.MAGENTO_BASE_URL || process.env.MAGE_MAGENTO_GRAPHQL_URL
    ? 'magento'
    : 'better-auth'
}

const authCookieName = () => process.env.AUTH_COOKIE_NAME || 'auth-token'
const magentoRequestTimeoutMs = () => {
  const parsed = Number.parseInt(process.env.MAGENTO_AUTH_TIMEOUT_MS || '', 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 15000
}

const magentoGraphqlEndpoint = () => {
  const magentoBaseUrl = process.env.MAGENTO_BASE_URL || ''
  const endpoint =
    process.env.AUTH_ENDPOINT ||
    process.env.MAGE_MAGENTO_GRAPHQL_URL ||
    process.env.MAGENTO_GRAPHQL_ENDPOINT ||
    process.env.COMMERCE_GRAPHQL_ENDPOINT ||
    (process.env.MAGE_STORE_URL ? `${process.env.MAGE_STORE_URL.replace(/\/$/, '')}/graphql` : '') ||
    (magentoBaseUrl ? `${magentoBaseUrl.replace(/\/$/, '')}/graphql` : '')

  if (!endpoint) {
    throw createError({ statusCode: 500, statusMessage: 'Magento endpoint is not configured' })
  }

  return endpoint
}

const magentoRequest = async <T>(query: string, variables: Record<string, unknown>, token?: string): Promise<T> => {
  const endpoint = magentoGraphqlEndpoint()
  const headers: Record<string, string> = { 'content-type': 'application/json' }
  if (token) headers.authorization = `Bearer ${token}`
  const timeoutMs = magentoRequestTimeoutMs()
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  let response: Response
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables }),
      signal: controller.signal,
    })
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      throw createError({
        statusCode: 504,
        statusMessage: `Magento auth endpoint timed out after ${timeoutMs}ms: ${endpoint}`,
      })
    }
    throw createError({
      statusCode: 502,
      statusMessage: `Unable to reach Magento auth endpoint: ${endpoint}`,
    })
  } finally {
    clearTimeout(timeout)
  }

  const rawBody = await response.text()
  let json: { data?: T; errors?: Array<{ message?: string }> }

  try {
    json = JSON.parse(rawBody) as { data?: T; errors?: Array<{ message?: string }> }
  } catch {
    throw createError({
      statusCode: 502,
      statusMessage: `Magento auth endpoint did not return JSON (${endpoint}). Check AUTH_ENDPOINT/MAGE_MAGENTO_GRAPHQL_URL/MAGENTO_BASE_URL.`,
    })
  }

  if (json.errors?.length) {
    throw createError({ statusCode: 401, statusMessage: json.errors[0]?.message || 'Authentication failed' })
  }
  if (!json.data) {
    throw createError({ statusCode: 500, statusMessage: 'Invalid adapter response' })
  }
  return json.data
}

const normalizeMagentoUser = (customer: any): AdapterAuthUser => ({
  id: String(customer?.id || customer?.email || ''),
  email: customer?.email || null,
  name: [customer?.firstname, customer?.lastname].filter(Boolean).join(' ').trim() || customer?.email || null,
  role: 'customer',
  first_name: customer?.firstname || null,
  last_name: customer?.lastname || null,
})

const signInMagento = async (email: string, password: string): Promise<AdapterAuthResult> => {
  const login = await magentoRequest<{ generateCustomerToken?: { token?: string } }>(
    `mutation GenerateCustomerToken($email: String!, $password: String!) {
      generateCustomerToken(email: $email, password: $password) { token }
    }`,
    { email, password },
  )

  const token = login.generateCustomerToken?.token
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  }

  const me = await magentoRequest<{ customer?: any }>(
    `query GetCustomer { customer { id firstname lastname email } }`,
    {},
    token,
  )

  if (!me.customer) {
    throw createError({ statusCode: 401, statusMessage: 'Could not load customer profile' })
  }

  return {
    token,
    user: normalizeMagentoUser(me.customer),
  }
}

const signUpMagento = async (input: { email: string; password: string; name?: string }) => {
  const [firstNameRaw, ...rest] = String(input.name || '').trim().split(' ').filter(Boolean)
  const firstName = firstNameRaw || 'User'
  const lastName = rest.join(' ') || 'Account'

  const createV2 = await magentoRequest<{ createCustomerV2?: { customer?: any } }>(
    `mutation CreateCustomerV2($input: CustomerCreateInput!) {
      createCustomerV2(input: $input) {
        customer { id firstname lastname email }
      }
    }`,
    {
      input: {
        firstname: firstName,
        lastname: lastName,
        email: input.email,
        password: input.password,
        is_subscribed: false,
      },
    },
  ).catch(async () => {
    const legacy = await magentoRequest<{ createCustomer?: { customer?: any } }>(
      `mutation CreateCustomer($input: CustomerInput!) {
        createCustomer(input: $input) {
          customer { id firstname lastname email }
        }
      }`,
      {
        input: {
          firstname: firstName,
          lastname: lastName,
          email: input.email,
          password: input.password,
        },
      },
    )
    return { createCustomerV2: { customer: legacy.createCustomer?.customer } }
  })

  if (!createV2.createCustomerV2?.customer) {
    throw createError({ statusCode: 400, statusMessage: 'Failed to create customer' })
  }

  return signInMagento(input.email, input.password)
}

registerAdapter({
  name: 'magento',
  signIn: async (payload) => {
    const { email, password } = ensureNonEmptyCredentials(payload)
    return signInMagento(email, password)
  },
  signUp: async (payload) => {
    const { email, password } = ensureNonEmptyCredentials(payload)
    return signUpMagento({
      email,
      password,
      name: payload?.name,
    })
  },
  getSession: async (token) => {
    const me = await magentoRequest<{ customer?: any }>(
      `query GetCustomer { customer { id firstname lastname email } }`,
      {},
      token,
    )
    if (!me.customer) return null
    return normalizeMagentoUser(me.customer)
  },
  signOut: async (token) => {
    await magentoRequest<{ revokeCustomerToken?: { result?: boolean } }>(
      `mutation RevokeCustomerToken { revokeCustomerToken { result } }`,
      {},
      token,
    )
  },
})

const getActiveAdapterProvider = async (): Promise<AdapterProvider> => {
  await ensureRegistrarsLoaded()

  const configured = configuredAdapterFromEnv()
  const activeName = normalizeAdapterName(runtimeAdapter())
  const activeProvider = providerRegistry.get(activeName)
  if (activeProvider) return activeProvider

  if (configured) {
    const available = getAvailableAdapters().join(', ') || 'none'
    throw createError({
      statusCode: 500,
      statusMessage: `Configured auth adapter '${configured}' is not registered. Registered adapters: ${available}`,
    })
  }

  const fallbackName = process.env.MAGE_STORE_URL ? 'magento' : 'better-auth'
  const fallbackProvider = providerRegistry.get(fallbackName)
  if (fallbackProvider) return fallbackProvider

  const [firstAvailable] = getAvailableAdapters()
  if (firstAvailable) {
    return providerRegistry.get(firstAvailable) as AdapterProvider
  }

  throw createError({ statusCode: 500, statusMessage: 'No auth adapters are registered' })
}

const attachSessionCookie = (event: H3Event, token: string, rememberMe = false) => {
  setCookie(event, authCookieName(), token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    ...(rememberMe ? { maxAge: 60 * 60 * 24 * 7 } : {}),
  })
}

export const getAdapterSession = async (event: H3Event) => {
  const provider = await getActiveAdapterProvider()

  const token = getCookie(event, authCookieName())
  if (!token) return null

  try {
    const user = await provider.getSession(token)
    if (!user) return null

    const session: AdapterSession = {
      session: {
        token,
      },
      user,
    }

    return session
  } catch {
    return null
  }
}

export const adapterSignIn = async (event: H3Event, payload: { email?: string; password?: string; rememberMe?: boolean }) => {
  const provider = await getActiveAdapterProvider()
  const result = await provider.signIn(payload)
  attachSessionCookie(event, result.token, Boolean(payload?.rememberMe))

  return { session: { token: result.token }, user: result.user }
}

export const adapterSignUp = async (
  event: H3Event,
  payload: { email?: string; password?: string; name?: string },
) => {
  const provider = await getActiveAdapterProvider()
  const result = await provider.signUp(payload)
  attachSessionCookie(event, result.token)

  return { session: { token: result.token }, user: result.user }
}

export const adapterSignOut = async (event: H3Event) => {
  const provider = await getActiveAdapterProvider()
  const token = getCookie(event, authCookieName())
  if (token && provider.signOut) {
    try {
      await provider.signOut(token)
    } catch {
      // Ignore logout errors; cookie clear is still authoritative client-side.
    }
  }

  deleteCookie(event, authCookieName(), { path: '/' })
  return { success: true }
}

export const getAuthBackend = () => runtimeAdapter()

import { createError, defineEventHandler, getRouterParam, readBody } from 'h3'
import { z } from 'zod'
import { requireAuth } from '#auth/server/utils/sessions'
import { useFederationNetwork, withNetworkTimeout } from '../../../../utils/federation'
import { redis } from '#shared/server/utils/redis'
import { saveConnection } from '../../../../utils/federation-connections'

/**
 * PUT /api/social/federation/connections/:network — connect a network.
 * 'account' networks: { server, username, password… } (the network's
 * fields), checked against the member's own server before anything is
 * stored; credentials are kept encrypted. 'opt-in' networks: {} turns it on.
 */
// Signing in to someone's server with a password they type: at most
// ATTEMPTS tries per member per WINDOW, so this can't be used to guess
// passwords on other servers.
const ATTEMPTS = 5
const WINDOW_SECONDS = 600

async function allowAttempt(userId: string): Promise<boolean> {
  const key = `meeovi:federation-connect:${userId}`
  try {
    const count = await redis.incr(key)
    if (count === 1) await redis.expire(key, WINDOW_SECONDS)
    return count <= ATTEMPTS
  } catch {
    return true // Redis down: don't lock members out of settings
  }
}

const Body = z.record(z.string().max(64), z.string().max(2048)).default({})

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event) as { id: string }
  const network = useFederationNetwork(String(getRouterParam(event, 'network') || ''))
  const connection = network.connection
  if (!connection) throw createError({ statusCode: 404, statusMessage: `${network.label} can't be connected to an account` })
  const parsed = Body.safeParse(await readBody(event).catch(() => ({})) ?? {})
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: 'Invalid details' })

  if (connection.kind === 'opt-in') {
    await saveConnection(user.id, network.id, { settings: { enabled: true } })
    return { connected: true, account: null, service: null }
  }

  // Only the fields the network asks for, trimmed (passwords as typed).
  const input: Record<string, string> = {}
  for (const field of connection.fields ?? []) {
    const raw = parsed.data[field.name] ?? ''
    const value = field.type === 'password' ? raw : raw.trim()
    if (field.required !== false && !value) throw createError({ statusCode: 400, statusMessage: `${field.label} is required` })
    if (value) input[field.name] = value
  }
  if (typeof connection.connect !== 'function') throw createError({ statusCode: 501, statusMessage: `${network.label} can't be connected yet` })
  if (!(await allowAttempt(user.id))) throw createError({ statusCode: 429, statusMessage: 'Too many tries. Wait 10 minutes and try again.' })

  let result: Awaited<ReturnType<NonNullable<typeof connection.connect>>>
  try {
    result = await withNetworkTimeout(connection.connect(input), 20_000)
  } catch (error: any) {
    // The plugin's message says what was wrong (wrong password, not a hub…).
    throw createError({ statusCode: 400, statusMessage: String(error?.message || `Couldn't sign in to ${network.label}`).slice(0, 200) })
  }
  await saveConnection(user.id, network.id, { account: result.account, service: result.service ?? null, credentials: result.credentials })
  return { connected: true, account: result.account, service: result.service ?? null }
})

import { createHmac } from 'node:crypto'

/**
 * Server-side client for the self-hosted Novu instance
 * (/home/meebuzo/github/novu, docker-compose project "novu"). Replaces the
 * old in-house notifications system (a `notifications` Directus collection
 * written directly via createItem — see follow.post.ts's git history for
 * the pattern this superseded): Novu owns the data now, this just triggers
 * its workflows and manages its subscribers.
 */

interface NovuConfig {
  apiUrl: string
  secretKey: string
}

function getNovuConfig(): NovuConfig {
  const config = useRuntimeConfig()
  const apiUrl = (config as { novuApiUrl?: string }).novuApiUrl || 'http://localhost:3090'
  const secretKey = (config as { novuSecretKey?: string }).novuSecretKey

  if (!secretKey) {
    throw new Error('NOVU_SECRET_KEY is not configured')
  }

  return { apiUrl, secretKey }
}

async function novuFetch(path: string, init: RequestInit = {}): Promise<unknown> {
  const { apiUrl, secretKey } = getNovuConfig()
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `ApiKey ${secretKey}`,
      ...(init.headers as Record<string, string> | undefined),
    },
  })

  // 409 = subscriber/resource already exists — expected on repeat calls
  // (ensureNovuSubscriber is called opportunistically, not just once).
  if (!response.ok && response.status !== 409) {
    const body = await response.text().catch(() => '')
    throw new Error(`Novu API ${path} failed: ${response.status} ${body}`)
  }

  if (response.status === 204 || response.status === 409) {
    return null
  }

  return response.json().catch(() => null)
}

/**
 * Novu's recommended production subscriber authentication: an HMAC of the
 * subscriber id, signed with the same secret key used server-side. Without
 * this, the frontend's `subscriber` option is just a claimed id anyone
 * could pass — with it, Novu verifies the request actually came from a
 * server that knows the secret. See useNovuSession() (the client composable
 * that consumes this via /api/novu/session).
 */
export function getNovuSubscriberHash(subscriberId: string): string {
  const { secretKey } = getNovuConfig()
  return createHmac('sha256', secretKey).update(subscriberId).digest('hex')
}

/**
 * Best-effort, idempotent (Novu 409s on a duplicate subscriberId, which
 * novuFetch treats as success). Call this before triggering a workflow for
 * a subscriber that might not exist in Novu yet, and from the session
 * endpoint so a user's inbox has a subscriber to attach to on first load.
 */
export async function ensureNovuSubscriber(params: {
  id: string
  email?: string | null
  name?: string | null
}): Promise<void> {
  try {
    await novuFetch('/v2/subscribers', {
      method: 'POST',
      body: JSON.stringify({
        subscriberId: params.id,
        email: params.email || undefined,
        firstName: params.name || undefined,
      }),
    })
  } catch (error) {
    console.error('[novu] failed to upsert subscriber', error)
  }
}

/**
 * Fires an in-app notification via a Novu workflow. Best-effort by design
 * (swallows and logs) — this mirrors what every call site in the old
 * system did manually with its own try/catch (see follow.post.ts's
 * git history), centralized here so a notification failure never fails the
 * action that triggered it (a follow, a purchase, a post).
 */
export async function triggerNovuWorkflow(
  workflowId: string,
  params: { to: string | string[]; payload: Record<string, unknown> },
): Promise<void> {
  try {
    await novuFetch('/v1/events/trigger', {
      method: 'POST',
      body: JSON.stringify({
        name: workflowId,
        to: params.to,
        payload: params.payload,
      }),
    })
  } catch (error) {
    console.error(`[novu] failed to trigger workflow "${workflowId}"`, error)
  }
}

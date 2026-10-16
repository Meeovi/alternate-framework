import type { H3Event } from 'h3'
import { createError } from 'h3'
import { and, eq } from 'drizzle-orm'
import { requireAuth, getAuthSession } from './sessions'
import { db } from './drizzle'
import { authOrganizations, authOrganizationMembers } from '../database/migrations/schema'

// Roles that may manage the organization's money. better-auth stores
// several roles comma-separated ("admin,member").
const MANAGER_ROLES = ['owner', 'admin']

/**
 * Gate for the /api/stripe/* routes, which act on the *active
 * organization's* Stripe Connect account: balance, payouts, onboarding and
 * Express-dashboard login links (full control over payouts). Being signed
 * in, or merely a member, isn't enough — only the org's owners/admins.
 *
 *   401 signed out · 400 no active organization · 403 not an owner/admin
 */
export async function requireOrgStripeManager(event: H3Event) {
  const user = await requireAuth(event)
  const session = await getAuthSession(event)
  const organizationId = session?.session?.activeOrganizationId as string | undefined
  if (!organizationId) {
    throw createError({ statusCode: 400, statusMessage: 'No active organization' })
  }

  const [membership] = await db
    .select({ role: authOrganizationMembers.role })
    .from(authOrganizationMembers)
    .where(and(
      eq(authOrganizationMembers.organizationId, organizationId),
      eq(authOrganizationMembers.userId, user.id),
    ))
    .limit(1)
  const roles = (membership?.role || '').split(',').map((r) => r.trim())
  if (!roles.some((r) => MANAGER_ROLES.includes(r))) {
    throw createError({ statusCode: 403, statusMessage: "Only the organization's owners and admins can manage its payments" })
  }

  const [org] = await db
    .select()
    .from(authOrganizations)
    .where(eq(authOrganizations.id, organizationId))
    .limit(1)
  if (!org) {
    throw createError({ statusCode: 404, statusMessage: 'Organization not found' })
  }

  // better-auth's organization plugin stores metadata as a JSON string.
  let metadata: Record<string, unknown> = {}
  try { metadata = org.metadata ? JSON.parse(org.metadata) : {} } catch { /* treat as empty */ }

  return {
    user,
    org,
    organizationId,
    metadata,
    stripeAccountId: typeof metadata.stripeAccountId === 'string' ? metadata.stripeAccountId : undefined,
  }
}

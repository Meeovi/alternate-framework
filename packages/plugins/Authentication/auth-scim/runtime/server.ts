import { APIError } from 'better-auth/api'
import { scim } from '@better-auth/scim'
import type { AuthPluginContext } from './types'

const hasRole = (roles: unknown, role: string) =>
  String(roles || '').split(',').map((r) => r.trim()).includes(role)

/**
 * Who may mint a SCIM token. @better-auth/scim <1.7 doesn't bind a provider
 * that has no organization to its owner (GHSA "account/provider takeover
 * via missing owner binding on non-organization providers"), and anyone can
 * create an organization and own it. So org admins/owners may only mint
 * tokens for their own organization's provider; tokens for non-organization
 * providers are site-admin only.
 */
export function canGenerateScimToken(user: { role?: unknown } | null | undefined, member: { role?: unknown } | null | undefined): boolean {
  const isAdmin = hasRole(user?.role, 'admin')
  const isOrgAdmin = !!member && (hasRole(member.role, 'admin') || hasRole(member.role, 'owner'))
  return member ? isOrgAdmin || isAdmin : isAdmin
}

export default function scimPlugin({ logAuditEvent }: AuthPluginContext) {
  return scim({
    beforeSCIMTokenGenerated: async ({ user, member }) => {
      if (!canGenerateScimToken(user as { role?: unknown }, member)) {
        throw new APIError('FORBIDDEN', { message: 'User does not have enough permissions' })
      }
    },
    afterSCIMTokenGenerated: async ({ user }) => {
      await logAuditEvent({
        userId: user?.id,
        category: 'scim',
        action: 'scim_token_generated',
        targetType: 'user',
        targetId: user?.id || '',
        status: 'success',
        id: '',
      })
    },
  })
}

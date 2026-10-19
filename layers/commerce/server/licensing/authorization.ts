/**
 * Authorization contract (v1.0): who may do what. Pure — the host resolves
 * identity (Meeovi Auth, SSO, federated) into an AuthenticatedUser and
 * answers workspace/organisation questions through its providers; this
 * file only applies the rules.
 *
 * - Users: view their licenses, download owned content, install owned
 *   integrations (on themselves, or on a workspace/organisation they manage),
 *   activate and renew their own licenses.
 * - Workspace administrators: manage installations on their workspace and
 *   view its licenses.
 * - Platform administrators (role `admin`): everything, including
 *   suspending, revoking, expiring and manually issuing licenses, and
 *   managing templates and versions. (Licenses are normally issued by the
 *   purchase.completed commerce event, not a user request.)
 */
import type { AuthenticatedUser } from './interfaces'
import type { LicenseInstallationTargetType } from './models'
import { LicensingError } from './errors'

export const PLATFORM_ADMIN_ROLE = 'admin'

export const LICENSING_ACTIONS = [
  'license.view',
  'license.download',
  'license.install',
  'license.activate',
  'license.renew',
  'license.issue',
  'license.expire',
  'license.suspend',
  'license.revoke',
  'installation.list',
  'installation.remove',
  'workspace.licenses.view',
  'template.manage',
  'version.manage',
] as const
export type LicensingAction = typeof LICENSING_ACTIONS[number]

/** Actions only platform administrators may take. */
export const ADMIN_ONLY_ACTIONS: readonly LicensingAction[] = ['license.issue', 'license.expire', 'license.suspend', 'license.revoke', 'template.manage', 'version.manage']

/** Facts the host resolves before asking; omitted facts count as "no". */
export interface AuthorizationContext {
  /** Owner (userId) of the UserLicense acted on. */
  licenseOwnerId?: string
  /** Where an installation goes (install) or lives (remove/list). */
  target?: { type: LicenseInstallationTargetType, id: string }
  /** The user administers the target workspace (WorkspaceProvider). */
  canManageTargetWorkspace?: boolean
  /** The user administers the target organisation. */
  canManageTargetOrganisation?: boolean
}

export function isPlatformAdmin(user: AuthenticatedUser | null | undefined): boolean {
  return !!user?.roles?.includes(PLATFORM_ADMIN_ROLE)
}

function managesTarget(user: AuthenticatedUser, ctx: AuthorizationContext): boolean {
  const target = ctx.target
  if (!target) return false
  if (target.type === 'user') return target.id === user.id
  if (target.type === 'workspace') return !!ctx.canManageTargetWorkspace
  return !!ctx.canManageTargetOrganisation
}

export function isAllowed(user: AuthenticatedUser | null | undefined, action: LicensingAction, ctx: AuthorizationContext = {}): boolean {
  if (!user?.id) return false
  if (isPlatformAdmin(user)) return true
  if (ADMIN_ONLY_ACTIONS.includes(action)) return false
  const owns = !!ctx.licenseOwnerId && ctx.licenseOwnerId === user.id
  switch (action) {
    case 'license.view':
    case 'license.download':
    case 'license.activate':
    case 'license.renew':
      return owns
    case 'license.install':
      return owns && managesTarget(user, ctx)
    case 'installation.list':
      return owns || (ctx.target?.type !== 'user' && managesTarget(user, ctx))
    case 'installation.remove':
      return managesTarget(user, ctx) || (owns && ctx.target?.type === 'user')
    case 'workspace.licenses.view':
      return !!ctx.canManageTargetWorkspace || !!ctx.canManageTargetOrganisation
    default:
      return false
  }
}

/** Throws AUTH_REQUIRED (no user) or LICENSE_ACCESS_DENIED (not allowed). */
export function assertAllowed(user: AuthenticatedUser | null | undefined, action: LicensingAction, ctx: AuthorizationContext = {}): asserts user is AuthenticatedUser {
  if (!user?.id) throw new LicensingError('AUTH_REQUIRED', 'Sign in to manage licenses')
  if (!isAllowed(user, action, ctx)) throw new LicensingError('LICENSE_ACCESS_DENIED', 'You do not have access to this license', { action })
}

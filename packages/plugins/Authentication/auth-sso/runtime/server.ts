import { sso } from '@better-auth/sso'
import type { AuthPluginContext } from './types'

type UserInfo = { attributes?: Record<string, string | undefined> }

/** Organization role for a provisioned SSO user, from IdP attributes:
 *  managers, directors, VPs and the IT department are admins. */
export function ssoOrganizationRole(userInfo: UserInfo): 'admin' | 'member' {
  const department = userInfo.attributes?.department?.toLowerCase()
  const jobTitle = userInfo.attributes?.jobTitle?.toLowerCase() ?? ''
  if (['manager', 'director', 'vp'].some((title) => jobTitle.includes(title))) return 'admin'
  if (department === 'it') return 'admin'
  return 'member'
}

export default function ssoPlugin({ logAuditEvent }: AuthPluginContext) {
  return sso({
    provisionUser: async ({ user, userInfo, provider }) => {
      await logAuditEvent({
        userId: user.id,
        category: 'sso',
        action: 'sso_provision',
        targetType: 'user',
        targetId: user.id,
        status: 'success',
        details: JSON.stringify({ provider: provider.providerId, email: userInfo.email }),
        id: '',
      })
    },
    organizationProvisioning: {
      disabled: false,
      defaultRole: 'member',
      getRole: async ({ userInfo }) => ssoOrganizationRole(userInfo as UserInfo),
    },
    saml: {
      enableInResponseToValidation: true,
      allowIdpInitiated: false,
      requestTTL: 10 * 60 * 1000,
    },
  })
}

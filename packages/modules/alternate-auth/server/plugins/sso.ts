import { betterAuth } from "better-auth"
import { sso } from "@better-auth/sso";
import { prisma } from 'alternate-gateway/core'

// Minimal no-op helpers for provisioning flows. In a full integration these
// would create resources, call external APIs, and record audit events.
async function updateUserProfile(_userId: string, _data: Record<string, any>) { return }
async function createUserWorkspace(_userId: string) { return }
async function syncUserWithCRM(_userId: string, _userInfo: any) { return }
const auditLog = { create: async (entry: any) => prisma.audit_log_entries.create({ data: { id: entry.id || String(Date.now()), payload: entry, created_at: new Date(), ip_address: '' } as any }) }
async function getUserProfile(_userId: string) { return { ssoProvisioned: false } }
async function createUserResources(_userId: string) { return }
async function markAsProvisioned(_userId: string) { return }
async function updateUserAttributes(_userId: string, _attributes: any) { return }
async function syncWithExternalSystem(_user: any, _userInfo: any) { return }
async function logProvisioningError(_userId: string, _err: any) { console.error(_err) }

const ssoAuth = () => betterAuth({
    plugins: [
        sso({
            provisionUser: async ({ user, userInfo, token, provider }) => {
                await updateUserProfile(user.id, {
                    department: userInfo.attributes?.department,
                    jobTitle: userInfo.attributes?.jobTitle,
                    manager: userInfo.attributes?.manager,
                    lastSSOLogin: new Date(),
                });
                await createUserWorkspace(user.id);
                await syncUserWithCRM(user.id, userInfo);
                await auditLog.create({
                    userId: user.id,
                    action: 'sso_signin',
                    provider: provider.providerId,
                    metadata: { email: userInfo.email, ssoProvider: provider.issuer }
                });

                const existingProfile = await getUserProfile(user.id);
                if (!existingProfile.ssoProvisioned) {
                    await createUserResources(user.id);
                    await markAsProvisioned(user.id);
                }

                await updateUserAttributes(user.id, userInfo.attributes);

                try {
                    await syncWithExternalSystem(user, userInfo);
                } catch (error) {
                    console.error('Failed to sync user with external system:', error);
                    await logProvisioningError(user.id, error);
                }
            },
            organizationProvisioning: {
                disabled: false,
                defaultRole: "member",
                getRole: async ({ user, userInfo, provider }) => {
                    const department = userInfo.attributes?.department;
                    const jobTitle = userInfo.attributes?.jobTitle;
                    if (jobTitle?.toLowerCase().includes('manager') || jobTitle?.toLowerCase().includes('director') || jobTitle?.toLowerCase().includes('vp')) return 'admin'
                    if (department?.toLowerCase() === 'it') return 'admin'
                    return 'member'
                }
            },
            saml: {
                enableInResponseToValidation: true,
                allowIdpInitiated: false,
                requestTTL: 10 * 60 * 1000,
            }
        })
    ]
})

export default defineNitroPlugin(() => {
  // Keep this module compatible with Nitro plugin auto-loading.
})

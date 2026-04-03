import { betterAuth } from "better-auth"
import { organization } from "better-auth/plugins"
import { prisma } from '@mframework/core'

function makeErr(err: unknown) {
  return { ok: false, error: (err as Error)?.message ?? String(err) }
}

async function createOrganization(data: any, ownerId: string) {
  try {
    if (!((prisma as any)?.organization)) return makeErr('organization table not available')
    const org = await (prisma as any).organization.create({ data: { ...data, ownerId } })
    if ((prisma as any).organization_member) {
      await (prisma as any).organization_member.create({ data: { organizationId: org.id, userId: ownerId, role: 'owner' } })
    }
    return { ok: true, data: org }
  } catch (e) {
    return makeErr(e)
  }
}

async function getOrganizationById(id: string) {
  try {
    if (!((prisma as any)?.organization)) return makeErr('organization table not available')
    const org = await (prisma as any).organization.findUnique({ where: { id } })
    if (!org) return makeErr('not_found')
    return { ok: true, data: org }
  } catch (e) {
    return makeErr(e)
  }
}

async function listOrganizationsForUser(userId: string) {
  try {
    if (!((prisma as any)?.organization) || !((prisma as any)?.organization_member)) return { ok: true, data: [] }
    const orgs = await (prisma as any).organization.findMany({ where: { members: { some: { userId } } } })
    return { ok: true, data: orgs }
  } catch (e) {
    return makeErr(e)
  }
}

async function listMembers(organizationId: string) {
  try {
    if (!((prisma as any)?.organization_member)) return { ok: true, data: [] }
    const members = await (prisma as any).organization_member.findMany({ where: { organizationId } })
    return { ok: true, data: members }
  } catch (e) {
    return makeErr(e)
  }
}

async function addMember(organizationId: string, userId: string, role = 'member') {
  try {
    if (!((prisma as any)?.organization_member)) return makeErr('organization_member table not available')
    const member = await (prisma as any).organization_member.create({ data: { organizationId, userId, role } })
    return { ok: true, data: member }
  } catch (e) {
    return makeErr(e)
  }
}

async function removeMember(organizationId: string, userId: string) {
  try {
    if (!((prisma as any)?.organization_member)) return makeErr('organization_member table not available')
    await (prisma as any).organization_member.deleteMany({ where: { organizationId, userId } })
    return { ok: true, data: true }
  } catch (e) {
    return makeErr(e)
  }
}

async function changeMemberRole(organizationId: string, userId: string, role: string) {
  try {
    if (!((prisma as any)?.organization_member)) return makeErr('organization_member table not available')
    const member = await (prisma as any).organization_member.updateMany({ where: { organizationId, userId }, data: { role } })
    return { ok: true, data: member }
  } catch (e) {
    return makeErr(e)
  }
}

async function createInvite(organizationId: string, inviterId: string, email: string) {
  try {
    if (!((prisma as any)?.organization_invite)) return makeErr('organization_invite table not available')
    const code = Math.random().toString(36).slice(2, 10)
    const invite = await (prisma as any).organization_invite.create({ data: { organizationId, inviterId, email, code } })
    return { ok: true, data: invite }
  } catch (e) {
    return makeErr(e)
  }
}

async function acceptInvite(code: string, userId: string) {
  try {
    if (!((prisma as any)?.organization_invite)) return makeErr('organization_invite table not available')
    const invite = await (prisma as any).organization_invite.findUnique({ where: { code } })
    if (!invite) return makeErr('invite_not_found')
    if ((prisma as any).organization_member) {
      await (prisma as any).organization_member.create({ data: { organizationId: invite.organizationId, userId, role: 'member' } })
    }
    await (prisma as any).organization_invite.deleteMany({ where: { id: invite.id } })
    return { ok: true, data: { organizationId: invite.organizationId } }
  } catch (e) {
    return makeErr(e)
  }
}

async function updateOrganization(organizationId: string, updates: any) {
  try {
    if (!((prisma as any)?.organization)) return makeErr('organization table not available')
    const org = await (prisma as any).organization.update({ where: { id: organizationId }, data: updates })
    return { ok: true, data: org }
  } catch (e) {
    return makeErr(e)
  }
}

async function deleteOrganization(organizationId: string) {
  try {
    if (!((prisma as any)?.organization)) return makeErr('organization table not available')
    await (prisma as any).organization.delete({ where: { id: organizationId } })
    return { ok: true, data: true }
  } catch (e) {
    return makeErr(e)
  }
}

export const organizationAuth = betterAuth({
  plugins: [
    organization({
      allowUserToCreateOrganization: async (user: any) => {
        if (!user?.id) return false
        const res = await listOrganizationsForUser(user.id)
        if (!res.ok) return true
        // limit organizations per user to 5 by default
        return ((res as any).data || []).length < 5
      },

      validateOrganizationCreation: async (payload: any, _user: any) => {
        if (!payload || typeof payload.name !== 'string') return false
        return payload.name.length > 1
      },

      onOrganizationCreated: async (org: any, owner: any) => {
        try {
          // ensure the owner is added as member/owner
          if (org?.id && owner?.id) await addMember(org.id, owner.id, 'owner')
        } catch (e) {
          // swallow errors — core helper returns Result normally
        }
      },

      listOrganizationsForUser: async (user: any) => {
        const res = await listOrganizationsForUser(user.id)
        return res.ok ? (res as any).data : []
      },

      getOrganizationById: async (id: string) => {
        const res = await getOrganizationById(id)
        return res.ok ? (res as any).data : null
      },

      canInviteMember: async (_organization: any, inviter: any, _inviteeEmail: string) => {
        // Basic check: authenticated users can invite
        return !!inviter?.id
      },

      sendInvite: async (organization: any, inviter: any, inviteeEmail: string) => {
        const res = await createInvite(organization.id, inviter.id, inviteeEmail)
        return res.ok ? (res as any).data : { ok: false, error: (res as any).error }
      },

      acceptInvite: async (code: string, user: any) => {
        const res = await acceptInvite(code, user.id)
        return res.ok ? { success: true, organizationId: (res as any).data?.organizationId } : { success: false, error: (res as any).error }
      },

      removeMember: async (organizationId: string, memberId: string) => {
        const res = await removeMember(organizationId, memberId)
        return res.ok ? { success: true } : { success: false, error: (res as any).error }
      },

      updateOrganization: async (organizationId: string, updates: any) => {
        const res = await updateOrganization(organizationId, updates)
        return res.ok ? { success: true, organization: (res as any).data } : { success: false, error: (res as any).error }
      },

      deleteOrganization: async (organizationId: string) => {
        const res = await deleteOrganization(organizationId)
        return res.ok ? { success: true } : { success: false, error: (res as any).error }
      },

      listMembers: async (organizationId: string) => {
        const res = await listMembers(organizationId)
        return res.ok ? (res as any).data : []
      },

      changeMemberRole: async (organizationId: string, memberId: string, role: string) => {
        const res = await changeMemberRole(organizationId, memberId, role)
        return res.ok ? { success: true } : { success: false, error: (res as any).error }
      },
    }),
  ],
})

export default defineNitroPlugin(() => {
  // Keep this module compatible with Nitro plugin auto-loading.
})

import { prisma, isValidTable } from '../utils/prisma'
import type { Result } from '../types/core/result'

function makeErr<T = any>(err: unknown): Result<T> {
  return { ok: false, error: (err as Error)?.message ?? String(err) }
}

export async function createOrganization(data: any, ownerId: string): Promise<Result<any>> {
  try {
    if (!isValidTable('organization')) return makeErr('organization table not available')

    const org = await (prisma as any).organization.create({
      data: {
        ...data,
        ownerId,
      },
    })

    // create membership record
    if (isValidTable('organization_member')) {
      await (prisma as any).organization_member.create({
        data: { organizationId: org.id, userId: ownerId, role: 'owner' },
      })
    }

    return { ok: true, data: org }
  } catch (e) {
    return makeErr(e)
  }
}

export async function getOrganizationById(id: string): Promise<Result<any>> {
  try {
    if (!isValidTable('organization')) return makeErr('organization table not available')
    const org = await (prisma as any).organization.findUnique({ where: { id } })
    if (!org) return makeErr('not_found')
    return { ok: true, data: org }
  } catch (e) {
    return makeErr(e)
  }
}

export async function listOrganizationsForUser(userId: string): Promise<Result<any[]>> {
  try {
    if (!isValidTable('organization') || !isValidTable('organization_member')) return { ok: true, data: [] }
    const orgs = await (prisma as any).organization.findMany({
      where: { members: { some: { userId } } },
    })
    return { ok: true, data: orgs }
  } catch (e) {
    return makeErr(e)
  }
}

export async function listMembers(organizationId: string): Promise<Result<any[]>> {
  try {
    if (!isValidTable('organization_member')) return { ok: true, data: [] }
    const members = await (prisma as any).organization_member.findMany({ where: { organizationId } })
    return { ok: true, data: members }
  } catch (e) {
    return makeErr(e)
  }
}

export async function addMember(organizationId: string, userId: string, role = 'member'): Promise<Result<any>> {
  try {
    if (!isValidTable('organization_member')) return makeErr('organization_member table not available')
    const member = await (prisma as any).organization_member.create({ data: { organizationId, userId, role } })
    return { ok: true, data: member }
  } catch (e) {
    return makeErr(e)
  }
}

export async function removeMember(organizationId: string, userId: string): Promise<Result<true>> {
  try {
    if (!isValidTable('organization_member')) return makeErr('organization_member table not available')
    await (prisma as any).organization_member.deleteMany({ where: { organizationId, userId } })
    return { ok: true, data: true }
  } catch (e) {
    return makeErr(e)
  }
}

export async function changeMemberRole(organizationId: string, userId: string, role: string): Promise<Result<any>> {
  try {
    if (!isValidTable('organization_member')) return makeErr('organization_member table not available')
    const member = await (prisma as any).organization_member.updateMany({ where: { organizationId, userId }, data: { role } })
    return { ok: true, data: member }
  } catch (e) {
    return makeErr(e)
  }
}

// Invite flow: create + accept
export async function createInvite(organizationId: string, inviterId: string, email: string): Promise<Result<any>> {
  try {
    if (!isValidTable('organization_invite')) return makeErr('organization_invite table not available')
    const code = Math.random().toString(36).slice(2, 10)
    const invite = await (prisma as any).organization_invite.create({ data: { organizationId, inviterId, email, code } })
    return { ok: true, data: invite }
  } catch (e) {
    return makeErr(e)
  }
}

export async function acceptInvite(code: string, userId: string): Promise<Result<any>> {
  try {
    if (!isValidTable('organization_invite')) return makeErr('organization_invite table not available')
    const invite = await (prisma as any).organization_invite.findUnique({ where: { code } })
    if (!invite) return makeErr('invite_not_found')
    // add member
    if (isValidTable('organization_member')) {
      await (prisma as any).organization_member.create({ data: { organizationId: invite.organizationId, userId, role: 'member' } })
    }
    // optionally delete invite
    await (prisma as any).organization_invite.deleteMany({ where: { id: invite.id } })
    return { ok: true, data: { organizationId: invite.organizationId } }
  } catch (e) {
    return makeErr(e)
  }
}

export async function updateOrganization(organizationId: string, updates: any): Promise<Result<any>> {
  try {
    if (!isValidTable('organization')) return makeErr('organization table not available')
    const org = await (prisma as any).organization.update({ where: { id: organizationId }, data: updates })
    return { ok: true, data: org }
  } catch (e) {
    return makeErr(e)
  }
}

export async function deleteOrganization(organizationId: string): Promise<Result<true>> {
  try {
    if (!isValidTable('organization')) return makeErr('organization table not available')
    await (prisma as any).organization.delete({ where: { id: organizationId } })
    return { ok: true, data: true }
  } catch (e) {
    return makeErr(e)
  }
}

export default {
  createOrganization,
  getOrganizationById,
  listOrganizationsForUser,
  listMembers,
  addMember,
  removeMember,
  changeMemberRole,
  createInvite,
  acceptInvite,
  updateOrganization,
  deleteOrganization,
}

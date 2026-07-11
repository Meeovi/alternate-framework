// shared/app/composables/organization/useOrganization.ts
import { authClient } from '../../../lib/auth-client'
import { ref } from 'vue'

export function useOrganization() {
  const organizations = authClient.useListOrganizations()
  const activeOrgState = authClient.useActiveOrganization?.()

  const activeOrganizationId = ref(activeOrgState?.value?.data?.id || null)

  const loading = ref(false)
  const actionLoading = ref(false)
  const error = ref<string | null>(null)
  const message = ref<string | null>(null)

  // ---------------------------
  // ORGANIZATIONS
  // ---------------------------
  async function loadOrganizations() {
    loading.value = true
    error.value = null

    try {
      const { data, error: listError } = await authClient.organization.list({ limit: 50 })
      if (listError) throw listError
      organizations.value = Array.isArray(data) ? data : []
    } catch (err: any) {
      error.value = err?.message || 'Failed to load organizations'
      organizations.value = []
    } finally {
      loading.value = false
    }
  }

  async function createOrganization(name: string) {
    actionLoading.value = true
    error.value = null
    message.value = null

    try {
      await authClient.organization.create({ name })
      message.value = 'Organization created'
      await loadOrganizations()
    } catch (err: any) {
      error.value = err?.message || 'Failed to create organization'
    } finally {
      actionLoading.value = false
    }
  }

  async function setActive(organizationId: string) {
    actionLoading.value = true
    error.value = null
    message.value = null

    try {
      await authClient.organization.setActive({ organizationId })
      message.value = 'Active organization updated'
      await loadOrganizations()
    } catch (err: any) {
      error.value = err?.message || 'Failed to set active organization'
    } finally {
      actionLoading.value = false
    }
  }

  async function leave(organizationId: string) {
    actionLoading.value = true
    error.value = null
    message.value = null

    try {
      await authClient.organization.leave({ organizationId })
      message.value = 'You left the organization'
      await loadOrganizations()
    } catch (err: any) {
      error.value = err?.message || 'Failed to leave organization'
    } finally {
      actionLoading.value = false
    }
  }

  // ---------------------------
  // ROLES
  // ---------------------------
  async function listRoles(organizationId: string) {
    return await authClient.organization.listRoles({ query: { organizationId } })
  }

  async function createRole(organizationId: string, roleName: string, permission: any) {
    return await authClient.organization.createRole({
      role: roleName,
      permission,
      organizationId,
    })
  }

  async function updateRole(organizationId: string, roleId: string, roleName: string, permission: any) {
    return await authClient.organization.updateRole({
      roleId,
      roleName,
      organizationId,
      data: { roleName, permission },
    })
  }

  async function deleteRole(organizationId: string, roleId: string) {
    return await authClient.organization.deleteRole({
      roleId,
      organizationId,
    })
  }

  // ---------------------------
  // TEAMS
  // ---------------------------
  async function listTeams(organizationId: string) {
    return await authClient.organization.listTeams({ query: { organizationId } })
  }

  async function createTeam(organizationId: string, name: string) {
    return await authClient.organization.createTeam({
      name,
      organizationId,
    })
  }

  async function updateTeam(teamId: string, data: any) {
    return await authClient.organization.updateTeam({
      teamId,
      data,
    })
  }

  async function removeTeam(teamId: string, organizationId: string) {
    return await authClient.organization.removeTeam({
      teamId,
      organizationId,
    })
  }

  async function setActiveTeam(teamId: string) {
    return await authClient.organization.setActiveTeam({ teamId })
  }

  async function listUserTeams() {
    return await authClient.organization.listUserTeams()
  }

  async function listTeamMembers(teamId: string) {
    return await authClient.organization.listTeamMembers({ query: { teamId } })
  }

  async function addTeamMember(teamId: string, userId: string) {
    return await authClient.organization.addTeamMember({ teamId, userId })
  }

  async function removeTeamMember(teamId: string, userId: string) {
    return await authClient.organization.removeTeamMember({ teamId, userId })
  }

  async function inviteMember(email: string, role: string, teamId?: string) {
    return await authClient.organization.inviteMember({ email, role, teamId })
  }

  return {
    organizations,
    activeOrganizationId,
    loading,
    actionLoading,
    error,
    message,

    loadOrganizations,
    createOrganization,
    setActive,
    leave,

    listRoles,
    createRole,
    updateRole,
    deleteRole,

    listTeams,
    createTeam,
    updateTeam,
    removeTeam,
    setActiveTeam,
    listUserTeams,
    listTeamMembers,
    addTeamMember,
    removeTeamMember,
    inviteMember,
  }
}

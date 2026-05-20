// ...existing code...
// Replace Nuxt UI's FormSubmitEvent with your own type
export interface FormSubmitEvent<T> {
  data: T
  event?: Event
}

import type { Organization, Member } from 'better-auth/plugins'

export const useCurrentOrganization = () => {
  return useState<Organization | null>('organization', () => null)
}

export function useOrgs() {
  const { client } = useAuth()
  const organization = useCurrentOrganization()
  const activeOrganizationId = useCookie('activeOrganizationId')
  const toast = useToast() // <-- still works, Vuetify doesn't replace this

  const organizations = useState<FullOrganization[]>('organizations', () => [])
  const isLoading = useState('orgs-loading', () => false)
  const hasOrganizations = computed(() => organizations.value && organizations.value.length > 0)

  async function getFullOrganization(orgId?: string): Promise<FullOrganization | null> {
    try {
      const data = await $fetch<FullOrganization>('/api/organization', {
        method: 'GET',
        params: orgId ? { organizationId: orgId } : undefined,
      })
      return data
    } catch (error) {
      toast.add({
        title: 'Failed to fetch organization',
        description: String(error),
        color: 'error',
      })
      return null
    }
  }

  async function fetchOrganizations() {
    if (isLoading.value) return organizations.value
    isLoading.value = true
    try {
      const data = await $fetch<FullOrganization[]>('/api/organizations', { method: 'GET' })
      const orgList = Array.isArray(data) ? data : []
      const fullOrgs = await Promise.all(
        orgList.map((org) => getFullOrganization(org.id))
      ) as FullOrganization[]
      organizations.value = fullOrgs
      if (!activeOrganizationId.value && fullOrgs.length > 0) {
        const [firstOrg] = fullOrgs
        if (firstOrg) {
          activeOrganizationId.value = firstOrg.id
          console.log(`Auto-selecting first organization: ${firstOrg.name}`)
        }
      }
      return fullOrgs
    } catch (error) {
      toast.add({
        title: 'Failed to fetch organizations',
        description: String(error),
        color: 'error',
      })
      return organizations.value
    } finally {
      isLoading.value = false
    }
  }

  async function fetchCurrentOrganization() {
    if (!activeOrganizationId.value) return null
    const org = await getFullOrganization(activeOrganizationId.value)
    organization.value = org as any
    return organization.value
  }

  async function selectTeam(id: string, options: { showToast?: boolean } = {}) {
    const { showToast = true } = options
    try {
      await $fetch('/api/organization/select', {
        method: 'POST',
        body: { organizationId: id },
      })
      activeOrganizationId.value = id
      await fetchCurrentOrganization()
      if (showToast) {
        toast.add({
          title: 'Team selected',
          description: 'Team selected successfully',
          color: 'success',
        })
      }
    } catch (error) {
      if (showToast) {
        toast.add({
          title: 'Failed to select team',
          description: String(error),
          color: 'error',
        })
      }
    }
    return true
  }

  async function checkSlug(slug: string): Promise<boolean> {
    try {
      const { isTaken } = await $fetch<{ isTaken: boolean }>('/api/organization/check-slug', {
        method: 'POST',
        body: { slug },
      })
      if (isTaken) {
        toast.add({
          title: 'Slug is taken',
          description: 'This slug is already taken.',
          color: 'error',
        })
        return false
      }
      return true
    } catch (error) {
      toast.add({
        title: 'Failed to check slug',
        description: String(error),
        color: 'error',
      })
      return false
    }
  }

  async function createTeam(event: FormSubmitEvent<CreateTeamSchema>, options: { showToast?: boolean } = {}) {
    const { showToast = true } = options
    const isSlugAvailable = await checkSlug(event.data.slug)
    if (!isSlugAvailable) return
    try {
      const data = await $fetch<{ id: string }>('/api/organization', {
        method: 'POST',
        body: {
          name: event.data.name,
          slug: event.data.slug,
          logo: event.data.logo,
        },
      })
      await fetchOrganizations()
      if (data && data.id) {
        await selectTeam(data.id, { showToast: false })
      }
      if (showToast) {
        toast.add({
          title: 'Team created',
          description: 'Team created successfully',
          color: 'success',
        })
      }
      return true
    } catch (error) {
      toast.add({
        title: 'Failed to create team',
        description: String(error),
        color: 'error',
      })
      return false
    }
  }
          function clearState() {
            activeOrganizationId.value = null
            organizations.value = []
            organization.value = null
          }
        async function deleteTeam(id: string, options: { showToast?: boolean } = {}) {
    const { showToast = true } = options
    try {
      await $fetch('/api/organization', {
        method: 'DELETE',
        body: { organizationId: id },
      })
      if (showToast) {
        toast.add({
          title: 'Team deleted',
          description: 'The team was deleted successfully.',
          color: 'success',
        })
      }
      await fetchOrganizations()
    } catch (error) {
      toast.add({
        title: 'Failed to delete team',
        description: String(error),
        color: 'error',
      })
    }
  }
    return {
      isLoading,
      hasOrganizations,
      organizations,
      fetchOrganizations,
      fetchCurrentOrganization,
      getFullOrganization,
      selectTeam,
      createTeam,
      deleteTeam,
      clearState,
    }
  }

import { useRuntimeConfig, useFetch } from 'nuxt/app'
import type { SpacesPageContent } from './useExperienceBuilder'

export function useExperiencePage () {
  const config = useRuntimeConfig()
  const apiBase = config.public?.experienceBuilder?.apiBase as string

  async function fetchPage (entityType: string, entityId: string, slug: string) {
    const { data, error } = await useFetch<SpacesPageContent>(`${apiBase}/${entityType}/${entityId}/${slug}`)
    if (error.value) throw error.value
    return data.value
  }

  return { fetchPage }
}

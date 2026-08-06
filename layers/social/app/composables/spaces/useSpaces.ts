import { ref, useRoute } from '#imports'
import type { SocialDriverContract, Space, Post, UserProfile } from '@mframework/alternate-sdk/contracts/social'
import { useSocialDriver } from '../useSocialDriver'

export const useSpaces = () => {
  const social = useSocialDriver()

  const getSpaces = async (opts?: { limit?: number; query?: string }): Promise<Space[]> => {
    return social.getSpaces?.(opts) ?? []
  }

  const getSpace = async (spaceId: string | number): Promise<Space | null> => {
    return social.getSpace?.(String(spaceId)) ?? null
  }

  const createSpace = async (data: { name: string; slug?: string; description?: string }): Promise<Space> => {
    return social.createSpace?.(data) as Promise<Space>
  }

  const joinSpace = async (spaceId: string | number): Promise<{ success: boolean }> => {
    return social.joinSpace?.(String(spaceId)) ?? { success: false }
  }

  const leaveSpace = async (spaceId: string | number): Promise<{ success: boolean }> => {
    return social.leaveSpace?.(String(spaceId)) ?? { success: false }
  }

  const getSpaceMembers = async (spaceId: string | number, opts?: { limit?: number }): Promise<UserProfile[]> => {
    return social.getSpaceMembers?.(String(spaceId), opts) ?? []
  }

  const getSpacePosts = async (spaceId: string | number, opts?: { limit?: number; offset?: number }): Promise<Post[]> => {
    return social.getSpacePosts?.(String(spaceId), opts) ?? []
  }

  return {
    getSpaces,
    getSpace,
    createSpace,
    joinSpace,
    leaveSpace,
    getSpaceMembers,
    getSpacePosts
  }
}

export const useSpace = async () => {
  const nuxtApp = useNuxtApp()
  const route = useRoute()

  const space = ref<Space | null>(null)
  const exists = ref(false)

  const refresh = async () => {
    const slug = Array.isArray(route.params.slug) ? route.params.slug.join('/') : route.params.slug
    if (!slug) {
      space.value = null
      exists.value = false
      return
    }

    try {
      // Try server-side social driver first (backend-agnostic API call)
      const social = useSocialDriver()
      const data = await social.getSpace?.(slug) ?? null
      space.value = data
      exists.value = !!data
    } catch {
      space.value = null
      exists.value = false
    }
  }

  await refresh()

  return { space, exists, refresh }
}

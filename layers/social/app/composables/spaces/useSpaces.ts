import { ref, useRoute } from '#imports'
import type { SocialDriverContract, Space, Post, UserProfile } from 'alternate-sdk/contracts'
import { useSocialDriver } from '../useSocialDriver'

export const useSpaces = () => {
  const social = useSocialDriver()

  const getSpaces = async (opts?: { limit?: number; query?: string }): Promise<Space[]> => {
    return social.spaces.getSpaces?.(opts) ?? []
  }

  const getSpace = async (spaceId: string | number): Promise<Space | null> => {
    return social.spaces.getSpace?.(String(spaceId)) ?? null
  }

  const createSpace = async (data: { name: string; slug?: string; description?: string }): Promise<Space> => {
    return social.spaces.createSpace?.(data) as Promise<Space>
  }

  const joinSpace = async (spaceId: string | number): Promise<{ success: boolean }> => {
    return social.spaces.joinSpace?.(String(spaceId)) ?? { success: false }
  }

  const leaveSpace = async (spaceId: string | number): Promise<{ success: boolean }> => {
    return social.spaces.leaveSpace?.(String(spaceId)) ?? { success: false }
  }

  const getSpaceMembers = async (spaceId: string | number, opts?: { limit?: number }): Promise<UserProfile[]> => {
    return social.spaces.getSpaceMembers?.(String(spaceId), opts) ?? []
  }

  const getSpacePosts = async (spaceId: string | number, opts?: { limit?: number; offset?: number }): Promise<Post[]> => {
    return social.spaces.getSpacePosts?.(String(spaceId), opts) ?? []
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
      const data = await social.spaces.getSpace?.(slug) ?? null
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

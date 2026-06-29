import { ref, useRoute } from '#imports'

export const useSpaces = () => {
  const nuxtApp = (globalThis as any).__nuxtApp || {}
  const adapter = nuxtApp?.$adapter || (globalThis as any).__adapter || null

  const call = async (method: string, payload: any, fallback: () => Promise<any>) => {
    if (adapter && typeof adapter[method] === 'function') {
      return adapter[method](payload)
    }
    return fallback()
  }

  const getSpaces = (opts?: any) =>
    call('getSpaces', opts, async () => {
      const params = new URLSearchParams({ ...(opts || {}) })
      const res = await fetch(`/api/social/spaces?${params}`)
      return res.json()
    })

  const getSpace = (spaceId: string | number) =>
    call('getSpace', { spaceId }, async () => {
      const res = await fetch(`/api/social/spaces/${spaceId}`)
      return res.json()
    })

  const createSpace = (data: any) =>
    call('createSpace', data, async () => {
      const res = await fetch(`/api/social/spaces`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      return res.json()
    })

  const joinSpace = (spaceId: string | number) =>
    call('joinSpace', { spaceId }, async () => {
      const res = await fetch(`/api/social/spaces/${spaceId}/join`, { method: 'POST' })
      return res.json()
    })

  const leaveSpace = (spaceId: string | number) =>
    call('leaveSpace', { spaceId }, async () => {
      const res = await fetch(`/api/social/spaces/${spaceId}/leave`, { method: 'POST' })
      return res.json()
    })

  const getSpaceMembers = (spaceId: string | number) =>
    call('getSpaceMembers', { spaceId }, async () => {
      const res = await fetch(`/api/social/spaces/${spaceId}/members`)
      return res.json()
    })

  const getSpacePosts = (spaceId: string | number, opts?: any) =>
    call('getSpacePosts', { spaceId, ...(opts || {}) }, async () => {
      const params = new URLSearchParams({ ...(opts || {}) })
      const res = await fetch(`/api/social/spaces/${spaceId}/posts?${params}`)
      return res.json()
    })

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
  const nuxtApp = (globalThis as any).__nuxtApp || {}
  const route = useRoute()

  const space = ref<any>(null)
  const exists = ref(false)

  const refresh = async () => {
    const slug = Array.isArray(route.params.slug) ? route.params.slug.join('/') : route.params.slug
    if (!slug) {
      space.value = null
      exists.value = false
      return
    }

    try {
      const sdkContent = nuxtApp?.$sdk?.content
      if (sdkContent && typeof sdkContent.readItems === 'function') {
        const resp = await sdkContent.readItems('spaces', {
          filter: { slug: { _eq: slug } },
          fields: ['*'],
          limit: 1
        })
        const data = resp?.data?.[0] || resp?.[0] || null
        space.value = data
        exists.value = !!data
      } else {
        const res = await fetch(`/api/social/spaces?slug=${encodeURIComponent(slug)}`)
        const data = await res.json()
        space.value = data?.[0] || data || null
        exists.value = !!space.value
      }
    } catch (e) {
      space.value = null
      exists.value = false
    }
  }

  space.refresh = refresh
  await refresh()

  return { space, exists }
}

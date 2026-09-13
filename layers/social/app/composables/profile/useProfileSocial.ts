import { useState } from '#imports'
import { useProfileIdentity } from './useProfileIdentity'

/**
 * The signed-in user's own social content for `/u/` — posts, spaces,
 * hashtags, events and (for sellers) shops.
 *
 * Reads go through the same-origin `/api/cms` Directus proxy with plain
 * `$fetch` (these run client-side from `onMounted`, so same-origin
 * cookies are sent automatically — the browser `$directus` SDK client
 * sends none, so its reads 401 at the proxy). Each collection is fetched
 * independently and failures are swallowed into an "unavailable" state.
 */
export function useProfileSocial() {
  const { user, customerFallback, displayName } = useProfileIdentity()

  const socialPosts = useState<any[]>('profile:posts', () => [])
  const spaces = useState<any[]>('profile:spaces', () => [])
  const hashtags = useState<any[]>('profile:hashtags', () => [])
  const events = useState<any[]>('profile:events', () => [])
  const shops = useState<any[]>('profile:shops', () => [])

  const socialPostsAvailable = useState('profile:posts-available', () => false)
  const spacesAvailable = useState('profile:spaces-available', () => false)
  const hashtagsAvailable = useState('profile:hashtags-available', () => false)
  const eventsAvailable = useState('profile:events-available', () => false)
  const shopsAvailable = useState('profile:shops-available', () => false)

  const socialPostsMessage = useState('profile:posts-message', () => 'No posts yet — share something above.')
  const spacesMessage = useState('profile:spaces-message', () => 'No spaces to show yet.')
  const hashtagsMessage = useState('profile:hashtags-message', () => 'No hashtags to show yet.')
  const eventsMessage = useState('profile:events-message', () => 'No events to show yet.')
  const shopsMessage = useState('profile:shops-message', () => 'No shops found for this seller account.')

  const identityValues = () => {
    const values = [
      user.value?.id,
      user.value?.email,
      customerFallback.value?.id,
      customerFallback.value?.email,
      displayName.value,
    ]
      .map((value) => String(value || '').toLowerCase())
      .filter(Boolean)
    return new Set(values)
  }

  const collectIdentityValues = (entry: any, depth = 0): string[] => {
    if (entry == null || depth > 2) return []
    if (typeof entry !== 'object') return [String(entry || '').toLowerCase()]

    const values: string[] = []
    const direct = [entry?.id, entry?.email, entry?.username, entry?.user_id, entry?.author, entry?.owner, entry?.created_by, entry?.account]
      .map((value: any) => String(value || '').toLowerCase())
      .filter(Boolean)

    values.push(...direct)
    for (const nested of Object.values(entry)) {
      values.push(...collectIdentityValues(nested, depth + 1))
    }
    return values
  }

  const matchCurrentUser = (entry: any) => {
    const mine = identityValues()
    const candidates = [
      entry?.user,
      entry?.user_id,
      entry?.author,
      entry?.owner,
      entry?.created_by,
      entry?.email,
      entry?.username,
      entry?.account,
    ]
      .flatMap((value: any) => (value == null ? [] : collectIdentityValues(value)))
      .map((value: any) => String(value || '').toLowerCase())

    if (!candidates.length) return true
    return candidates.some((value) => mine.has(value))
  }

  const loadSocialFeatures = async () => {
    const fetchCollection = async (collection: string, query: Record<string, any> = {}) => {
      const res: any = await $fetch(`/api/cms/items/${collection}`, {
        query: { sort: '-date_created', limit: 5, ...query },
      })
      return res?.data ?? res ?? []
    }

    const fetchEvents = async () => {
      const res: any = await $fetch('/api/cms/items/products', {
        query: {
          limit: 8,
          sort: '-date_created',
          fields: '*,*.*',
          filter: JSON.stringify({
            product_type: { product_types_id: { name: { _eq: 'Event' } } },
          }),
        },
      })
      const items = res?.data ?? res ?? []
      return (Array.isArray(items) ? items : []).filter((item: any) => {
        const typeName = item?.product_type?.product_types_id?.name || item?.type?.name || item?.type
        return String(typeName || '').toLowerCase() === 'event'
      })
    }

    try {
      const postsData = await fetchCollection('posts')
      socialPosts.value = (Array.isArray(postsData) ? postsData : []).filter(matchCurrentUser)
      socialPostsAvailable.value = true
      socialPostsMessage.value = socialPosts.value.length ? '' : 'No posts yet — share something above.'
    } catch {
      socialPostsAvailable.value = false
    }

    try {
      const spacesData = await fetchCollection('spaces')
      spaces.value = (Array.isArray(spacesData) ? spacesData : []).filter(matchCurrentUser)
      spacesAvailable.value = true
      spacesMessage.value = spaces.value.length ? '' : 'No spaces found.'
    } catch {
      spacesAvailable.value = false
    }

    try {
      const tagsData = await fetchCollection('hashtags')
      hashtags.value = Array.isArray(tagsData) ? tagsData : []
      hashtagsAvailable.value = true
      hashtagsMessage.value = hashtags.value.length ? '' : 'No hashtags found.'
    } catch {
      hashtagsAvailable.value = false
    }

    try {
      const eventsData = await fetchEvents()
      events.value = Array.isArray(eventsData) ? eventsData : []
      eventsAvailable.value = true
      eventsMessage.value = events.value.length ? '' : 'No events found.'
    } catch {
      eventsAvailable.value = false
    }

    try {
      const shopsData = await fetchCollection('shops')
      shops.value = (Array.isArray(shopsData) ? shopsData : []).filter(matchCurrentUser)
      shopsAvailable.value = true
      shopsMessage.value = shops.value.length ? '' : 'No shops found for your account.'
    } catch {
      shopsAvailable.value = false
    }
  }

  /** Optimistically show a just-created post at the top of the list. */
  const addPost = (post: any) => {
    if (!post) return
    socialPosts.value = [post, ...socialPosts.value]
    socialPostsAvailable.value = true
    socialPostsMessage.value = ''
  }

  return {
    socialPosts,
    spaces,
    hashtags,
    events,
    shops,
    socialPostsAvailable,
    spacesAvailable,
    hashtagsAvailable,
    eventsAvailable,
    shopsAvailable,
    socialPostsMessage,
    spacesMessage,
    hashtagsMessage,
    eventsMessage,
    shopsMessage,
    loadSocialFeatures,
    addPost,
  }
}

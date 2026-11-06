import type { FilterDef, SortFilterConfig } from '#shared/app/composables/useSortFilter'
import { byDate, byNumber, byText } from '#shared/app/composables/useSortFilter'

/**
 * Sorts and search for lists of notes, lists, spaces, stations, members and
 * hashtags, for useSortFilter + <SortFilterBar>. Works across the different
 * shapes these come in (Directus rows and federated items).
 */

export const itemDate = (item: any) =>
  item?.date_published || item?.date_created || item?.created_at || item?.createdAt || item?.indexedAt || item?.dateTime
export const itemName = (item: any) =>
  item?.name || item?.title || item?.displayName || item?.display_username || item?.username || item?.handle || item?.text || ''

export function contentSortFilter(
  id: string,
  options: { filters?: FilterDef<any>[], extraSearch?: (item: any) => unknown, sorts?: SortFilterConfig<any>['sorts'] } = {},
): SortFilterConfig<any> {
  return {
    id,
    sorts: [
      { value: 'newest', title: 'Newest', compare: byDate(itemDate) },
      { value: 'oldest', title: 'Oldest', compare: byDate(itemDate, false) },
      { value: 'name', title: 'Name: A to Z', compare: byText(itemName) },
      { value: 'name-desc', title: 'Name: Z to A', compare: byText(itemName, true) },
      ...(options.sorts ?? []),
    ],
    search: (item: any) => [
      itemName(item), item?.description, item?.summary, item?.handle, item?.username,
      options.extraSearch?.(item),
    ].join(' '),
    filters: options.filters ?? [],
  }
}

/** Meeovi or Bluesky, for pages that mix members/hashtags from both. */
export const networkFilter = (isFederated: (item: any) => boolean): FilterDef<any> => ({
  key: 'network',
  title: 'Network',
  options: [
    { value: 'meeovi', title: 'Meeovi' },
    { value: 'bluesky', title: 'Bluesky' },
  ],
  match: (item: any, value: string) => (value === 'bluesky') === isFederated(item),
})

const NETWORKS: Record<string, string> = { directus: 'Meeovi', atproto: 'Bluesky', activitypub: 'Fediverse' }

/** Notes (federated posts): newest, most liked …, filtered by network. */
export function notesSortFilter(id: string, items: () => any[] | null | undefined, prefix?: string): SortFilterConfig<any> {
  const count = (key: string) => (post: any) => post?.[key] ?? 0
  return {
    id,
    prefix,
    sorts: [
      { value: 'newest', title: 'Newest', compare: byDate(itemDate) },
      { value: 'oldest', title: 'Oldest', compare: byDate(itemDate, false) },
      { value: 'likes', title: 'Most liked', compare: byNumber(count('likes'), true) },
      { value: 'replies', title: 'Most replies', compare: byNumber(count('replies'), true) },
      { value: 'reposts', title: 'Most reposted', compare: byNumber(count('reposts'), true) },
    ],
    search: (post: any) => [post?.text, post?.title, post?.author?.displayName, post?.author?.handle, post?.username].join(' '),
    filters: [{
      key: 'network',
      title: 'Network',
      multiple: true,
      // Only the networks the loaded notes come from.
      options: () => Object.entries(NETWORKS)
        .filter(([value]) => (items() ?? []).some((post) => (post?.network || 'directus') === value))
        .map(([value, title]) => ({ value, title })),
      match: (post: any, value: string) => (post?.network || 'directus') === value,
    }],
  }
}

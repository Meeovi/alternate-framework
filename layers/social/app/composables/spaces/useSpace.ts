// layers/social/app/composables/useSpace.ts

import { ref, computed } from 'vue'
import { useNuxtApp, useAsyncData, useRoute } from '#imports'
import { normalizeSpaceRecord } from '../content/socialMappers'
import type { SpaceRecord } from '../../types/SpaceRecord'

export function useSpace() {
  const route = useRoute()
  const { $sdk } = useNuxtApp()

  const slug = computed(() => route.params.slug as string)

  const {
    data: space,
    pending,
    error,
    refresh
  } = useAsyncData<SpaceRecord | null>(
    () => `space-${slug.value}`,
    async () => {
      if (!slug.value) return null   // ❗ never return undefined

      const resp = await $sdk.content.readItems('spaces', {
        filter: { slug: { _eq: slug.value } },
        fields: [
          '*',
          'posts.posts_id.*',
          'image.*',
          'owner.*',
          'members.user.*',
          'products.products_id.*',
          'lists.lists_id.*',
          'media.*'
        ],
        limit: 1
      })

      const raw = resp?.[0] || null

      if (!raw) return null          // ❗ never return undefined

      return normalizeSpaceRecord(raw) as SpaceRecord
    },
    { watch: [slug] }
  )

  const exists = computed(() => !!space.value?.id)

  return {
    space,
    exists,
    pending,
    error,
    refresh,
    slug
  }
}

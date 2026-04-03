<script setup lang="ts">
import useStreaming from '@mframework/core/composables/useStreaming'
import { useMastoClient, useMasto } from '@mframework/core/index'
import { useNetwork } from '@vueuse/core'
import type { mastodon } from 'masto'
import { computed } from '#imports'
import { filterAndReorderTimeline } from '#social/app/composables/timeline'
import { currentUser } from '#social/app/composables/contacts/users'

const { isSupported, effectiveType } = useNetwork()
const isSlow = computed(() => isSupported.value && effectiveType.value && ['slow-2g', '2g', '3g'].includes(effectiveType.value))
const limit = computed(() => isSlow.value ? 10 : 30)

const paginator = useMastoClient().v1.timelines.home.list({ limit: limit.value })
const stream = useStreaming((client: { user: { subscribe: () => any } }) => client.user.subscribe())
function preprocess(items: mastodon.v1.Status[]) {
  return filterAndReorderTimeline(items, 'home')
}

let followedTags: mastodon.v1.Tag[]
if (currentUser.value !== undefined) {
  const { client } = useMasto()
  const paginator = client.value.v1.followedTags.list()
  followedTags = (await paginator.values().next()).value ?? []
}
</script>

<template>
  <div>
    <PublishWidgetList draft-key="home" />
    <div h="1px" w-auto bg-border mb-3 />
    <TimelinePaginator :followed-tags="followedTags" v-bind="{ paginator, stream }" :preprocess="preprocess" context="home" />
  </div>
</template>

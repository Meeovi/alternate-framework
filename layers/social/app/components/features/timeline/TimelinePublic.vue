<script setup lang="ts">
import useStreaming from 'alternate-gateway/core/composables/useStreaming'
import { useMastoClient, useMasto } from 'alternate-gateway/core/index'
import type { mastodon } from 'masto'
import { filterAndReorderTimeline } from '#social/app/composables/timeline'
import { currentUser } from '#social/app/composables/contacts/users'

const paginator = useMastoClient().v1.timelines.public.list({ limit: 30 })
const stream = useStreaming(client => client.public.subscribe())
function preprocess(items: mastodon.v1.Status[]) {
  return filterAndReorderTimeline(items, 'public')
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
    <TimelinePaginator :followed-tags="followedTags" v-bind="{ paginator, stream }" :preprocess="preprocess" context="public" />
  </div>
</template>

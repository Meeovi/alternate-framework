<script setup lang="ts">
import useContentAdapter from 'app/composables/useContentAdapter';
import type { mastodon } from 'masto'

type SearchResult = {
  type: 'account'
  data: mastodon.v1.Account
}

defineProps<{
  result: SearchResult
  active: boolean
}>()
const content = useContentAdapter()
</script>

<template>
  <CommonScrollIntoView
    as="div"
    :active="active"
    py2 block px2
    :aria-selected="active"
    :class="{ 'bg-active': active }"
  >
    <AccountInfo
      v-if="result.type === 'account'"
      :account="result.data"
    />
  </CommonScrollIntoView>
</template>

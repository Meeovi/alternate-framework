<script setup lang="ts">
import { useMastoClient } from '#social/app/composables/federation/masto/masto';

const paginator = useMastoClient().v1.bookmarks.list()
</script>

<template>
  <TimelinePaginator end-message="common.no_bookmarks" :paginator="paginator" />
</template>

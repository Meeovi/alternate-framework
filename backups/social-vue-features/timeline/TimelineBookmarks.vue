<script setup lang="ts">
import { useFederationClient as useMastoClient } from '#social/app/composables/useFederation';

const paginator = useMastoClient().v1.bookmarks.list()
</script>

<template>
  <TimelinePaginator end-message="common.no_bookmarks" :paginator="paginator" />
</template>

<script setup lang="ts">
import { useMastoClient } from '#social/app/composables/federation/masto/masto';

const paginator = useMastoClient().v1.favourites.list()
</script>

<template>
  <TimelinePaginator end-message="common.no_favourites" :paginator="paginator" />
</template>

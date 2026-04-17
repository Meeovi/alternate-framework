<script setup lang="ts">
import { useFederationClient as useMastoClient } from '#social/app/composables/useFederation';

const paginator = useMastoClient().v1.favourites.list()
</script>

<template>
  <TimelinePaginator end-message="common.no_favourites" :paginator="paginator" />
</template>

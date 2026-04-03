<script setup lang="ts">
import { useMastoClient } from '#social/app/composables/federation/masto/masto';

const paginator = useMastoClient().v1.blocks.list()
</script>

<template>
  <AccountPaginator :paginator="paginator" />
</template>

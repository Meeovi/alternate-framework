<script setup lang="ts">
import { useMastoClient } from '~/composables/masto/masto';

const paginator = useMastoClient().v1.blocks.list()
</script>

<template>
  <AccountPaginator :paginator="paginator" />
</template>

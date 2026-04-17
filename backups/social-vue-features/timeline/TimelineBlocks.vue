<script setup lang="ts">
import { useFederationClient as useMastoClient } from '#social/app/composables/useFederation';

const paginator = useMastoClient().v1.blocks.list()
</script>

<template>
  <AccountPaginator :paginator="paginator" />
</template>

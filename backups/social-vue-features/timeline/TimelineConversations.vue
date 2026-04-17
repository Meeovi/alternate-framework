<script setup lang="ts">
import { useFederationClient as useMastoClient } from '#social/app/composables/useFederation';

const paginator = useMastoClient().v1.conversations.list()
</script>

<template>
  <ConversationPaginator :paginator="paginator" />
</template>

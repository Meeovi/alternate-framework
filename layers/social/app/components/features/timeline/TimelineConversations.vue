<script setup lang="ts">
import { useMastoClient } from '#social/app/composables/federation/masto/masto';

const paginator = useMastoClient().v1.conversations.list()
</script>

<template>
  <ConversationPaginator :paginator="paginator" />
</template>

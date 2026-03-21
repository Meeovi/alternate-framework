<script setup lang="ts">
import { useMastoClient } from '~/composables/masto/masto';

const paginator = useMastoClient().v1.conversations.list()
</script>

<template>
  <ConversationPaginator :paginator="paginator" />
</template>

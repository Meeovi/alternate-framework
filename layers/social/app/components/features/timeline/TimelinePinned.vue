<script setup lang="ts">
import { useMastoClient } from '@mframework/core/index';
import { currentUser } from '~/composables/users';

const paginator = useMastoClient().v1.accounts.$select(currentUser.value!.account.id).statuses.list({ pinned: true })
</script>

<template>
  <TimelinePaginator :paginator="paginator" />
</template>

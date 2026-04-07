<script setup lang="ts">
import { useMastoClient } from 'alternate-gateway/core/index';
import { currentUser } from '#social/app/composables/contacts/users';

const paginator = useMastoClient().v1.accounts.$select(currentUser.value!.account.id).statuses.list({ pinned: true })
</script>

<template>
  <TimelinePaginator :paginator="paginator" />
</template>

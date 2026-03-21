<script setup lang="ts">
import { useMask } from '~/composables/mask';
import { currentUser } from '~/composables/users';

const mask = useMask()
</script>

<template>
  <VDropdown :distance="0" placement="top-start" strategy="fixed" @apply-show="mask.show()" @apply-hide="mask.hide()">
    <v-btn btn-action-icon :aria-label="$t('action.switch_account')">
      <div :class="{ 'hidden xl:block': currentUser }" i-ri:more-2-line />
      <AccountAvatar v-if="currentUser" xl:hidden :account="currentUser.account" w-9 h-9 square />
    </v-btn>
    <template #popper="{ hide }">
      <UserSwitcher @click="hide" />
    </template>
  </VDropdown>
</template>

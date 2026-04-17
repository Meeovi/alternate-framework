<script setup lang="ts">
import { useMask } from '#social/app/composables/mask';
import { currentUser } from '#social/app/composables/contacts/users';

const mask = useMask()
const menuOpen = ref(false)

function onMenuToggle(value: boolean) {
  menuOpen.value = value
  if (value)
    mask.show()
  else
    mask.hide()
}
</script>

<template>
  <v-menu v-model="menuOpen" location="top start" @update:model-value="onMenuToggle">
    <template #activator="{ props }">
      <v-btn v-bind="props" btn-action-icon :aria-label="$t('action.switch_account')">
        <div :class="{ 'hidden xl:block': currentUser }" i-ri:more-2-line />
        <AccountAvatar v-if="currentUser" xl:hidden :account="currentUser.account" w-9 h-9 square />
      </v-btn>
    </template>
    <template #default>
      <UserSwitcher @click="menuOpen = false" />
    </template>
  </v-menu>
</template>

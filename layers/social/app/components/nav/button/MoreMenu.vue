<script setup lang="ts">
const model = defineModel<boolean>()
</script>

<template>
  <NavBottomMoreMenu
    v-slot="{ toggleVisible, show }" v-model="model!" flex flex-row items-center
    place-content-center h-full flex-1 cursor-pointer
  >
    <v-btn
      flex items-center place-content-center h-full flex-1 class="select-none"
      :class="show ? '!text-primary' : ''"
      :aria-label="$t('nav.more_menu')"
      @click="toggleVisible"
    >
      <span :class="show ? 'i-ri:close-fill' : 'i-ri:more-fill'" />
    </v-btn>
  </NavBottomMoreMenu>
</template>

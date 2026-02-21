<template>
  <SfInput :type="isPasswordVisible ? 'text' : 'password'">
    <template #suffix>
      <UButton type="v-btn" @click="isPasswordVisible = !isPasswordVisible">
        <component :is="isPasswordVisible ? SfIconVisibilityOff : SfIconVisibility" />
      </UButton>
    </template>
  </SfInput>
</template>

<script setup lang="ts">
import { SfInput, SfIconVisibility, SfIconVisibilityOff } from '@storefront-ui/vue';

const isPasswordVisible = ref<boolean>();
</script>

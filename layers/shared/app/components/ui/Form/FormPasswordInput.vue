<template>
  <SfInput :type="isPasswordVisible ? 'text' : 'password'">
    <template #suffix>
      <v-btn type="v-btn" @click="isPasswordVisible = !isPasswordVisible">
        <component :is="isPasswordVisible ? SfIconVisibilityOff : SfIconVisibility" />
      </v-btn>
    </template>
  </SfInput>
</template>

<script setup lang="ts">
import { SfInput, SfIconVisibility, SfIconVisibilityOff } from '@storefront-ui/vue';

const isPasswordVisible = ref<boolean>();
</script>

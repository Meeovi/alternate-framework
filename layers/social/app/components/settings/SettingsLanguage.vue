<script setup lang="ts">
import type { LocaleObject } from 'alternate-locate'
import type { ComputedRef } from '#imports'
import { useLocate } from 'alternate-locate/adapters/vue/composable'
import { useUserSettings } from '#social/app/composables/settings';

const userSettings = useUserSettings()

const { locales } = useLocate() as { locales: ComputedRef<LocaleObject[]> }
</script>

<template>
  <select v-model="userSettings.language">
    <option v-for="item in locales" :key="item.code" :value="item.code" :selected="userSettings.language === item.code">
      {{ item.name }}
    </option>
  </select>
</template>

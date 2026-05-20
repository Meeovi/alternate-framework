<template>
  <AccountSettingsShell :title="title" :subtitle="subtitle">
    <template #alerts>
      <slot name="alerts" />
    </template>
    <template #sidebar>
      <slot name="sidebar" />
    </template>
    <template #content>
      <slot />
      <slot name="content-bottom" />
    </template>
    <template #right>
      <slot name="header-right" />
    </template>
  </AccountSettingsShell>
</template>

<script setup lang="ts">
import AccountSettingsShell from './AccountSettingsShell.vue'

withDefaults(
  defineProps<{
    title?: string
    subtitle?: string
  }>(),
  {
    title: 'Settings',
    subtitle: 'Manage your account experience',
  },
)
</script>

<script setup lang="ts">
withDefaults(
  defineProps<{
    items?: Array<{ id: string; name: string; src?: string }>
    limit?: number
    size?: string | number
  }>(),
  {
    items: () => [
      { id: '1', name: 'Ada Lovelace' },
      { id: '2', name: 'Grace Hopper' },
      { id: '3', name: 'Katherine Johnson' },
    ],
    limit: 3,
    size: 40,
  },
)

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
</script>

<template>
  <v-avatar-group border="md surface opacity-100" :limit="limit" :size="size" hoverable>
    <v-avatar
      v-for="item in items"
      :key="item.id"
      :image="item.src"
      :text="item.src ? undefined : initials(item.name)"
    />
  </v-avatar-group>
</template>

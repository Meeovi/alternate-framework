<template>
  <button class="create-list-btn" @click="$emit('create', lists)">Create List</button>
</template>

<script setup lang="ts">
const props = defineProps({ lists: { type: [String, Number, Object], required: false } })
</script>

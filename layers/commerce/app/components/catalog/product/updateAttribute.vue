<template>
    <DynamicForm collection="attributes" :id="id" />
</template>

<script setup>
import { DynamicForm } from '@mframework/meeovi-forms'

const props = defineProps({
  id: [String, Number],
})
</script>
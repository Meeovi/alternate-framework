<template>
    <div>
        <v-card elevation="0">
            <v-toolbar title="Update A Showcase"></v-toolbar>
            <DynamicForm collection="showcases" :id="id" />
        </v-card>
    </div>
</template>

<script setup>
import { DynamicForm } from '@mframework/meeovi-forms'

const props = defineProps({
  id: [String, Number],
})
</script>
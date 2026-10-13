<template>
  <div class="contentPage">
    <v-toolbar color="primary">
      <v-toolbar-title>New Speed Dial</v-toolbar-title>
    </v-toolbar>
    <DynamicForm collection="speeddials" />
  </div>
</template>

<script setup>
import { DynamicForm } from '@mframework/meeovi-forms'

definePageMeta({
  layout: 'workspace'
})
</script>
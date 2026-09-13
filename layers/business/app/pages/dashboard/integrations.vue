<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    <v-toolbar color="white">
      <v-toolbar-title>Integrations</v-toolbar-title>

      <v-toolbar-items>
        <v-btn title="Add a integration" href="/departments/appstore" text="Add a integration" variant="text"></v-btn>
      </v-toolbar-items>
    </v-toolbar>

    <p>This is the integrations page.</p>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'seller' })
useHead({
  title: 'Integrations',
  meta: [
    {
      name: 'description',
      content: 'This is the integrations page.'
    }
  ]
})
</script>

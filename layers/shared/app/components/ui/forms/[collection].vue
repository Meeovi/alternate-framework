<script setup>
import DynamicForm from './DynamicForm.vue'

const route = useRoute()
const collection = computed(() => String(route.params.collection || ''))
const formData = ref({})

// Usage examples:
// <DynamicForm :collection="collection" v-model="formData" :enable-turnstile="true" />
// <DynamicForm :collection="collection" v-model="formData" :enable-turnstile="false" />
// <DynamicForm :collection="collection" v-model="formData" />
</script>

<template>
  <div>
    <h1>Dynamic Form for {{ collection }}</h1>
    <DynamicForm :collection="collection" v-model="formData" clear-on-success />
    <pre>{{ formData }}</pre>
  </div>
</template>
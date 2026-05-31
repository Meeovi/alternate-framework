<script setup>
import DynamicForm from './DynamicForm.vue'

const route = useRoute()
const collection = computed(() => String(route.params.collection || ''))
const formData = ref({})
</script>

<template>
  <div>
    <h1>Dynamic Form for {{ collection }}</h1>
    <DynamicForm :collection="collection" v-model="formData" clear-on-success />
    <pre>{{ formData }}</pre>
  </div>
</template>
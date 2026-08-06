<script setup>
import { DynamicForm, useDirectusFields } from '@mframework/meeovi-forms'

const route = useRoute()
const collection = route.params.collection

const { fields: schemaFields, loading, error: schemaError, loadFields } = useDirectusFields()

const formData = ref({})

await loadFields(collection)
</script>

<template>
  <div>
    <h1>Dynamic Form for {{ collection }}</h1>
    <DynamicForm :collection="collection" :fields="schemaFields" v-model="formData" />
    <pre>{{ formData }}</pre>
  </div>
</template>
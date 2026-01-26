<script setup>
import AutoForm from '~/components/forms/DynamicForm.vue'
import { useDirectusSchema } from '@/layers/ui-app/app/composables/globals/useDirectusSchema.js'

const route = useRoute()
const collection = route.params.collection

const { data: schema } = await useAsyncData(
  `schema-${collection}`,
  () => useDirectusSchema(collection)
)

const formData = ref({})
</script>

<template>
  <div>
    <h1>Dynamic Form for {{ collection }}</h1>
    <AutoForm :schema="schema" v-model="formData" />
    <pre>{{ formData }}</pre>
  </div>
</template>
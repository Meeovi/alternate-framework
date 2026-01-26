<template>
  <div v-if="loading">Loading form…</div>

  <form v-else @submit.prevent="submit" class="space-y-4">
    <FormField v-for="field in schema" :key="field.key" :field="field" :form="engine.form" />

    <button type="submit" class="btn-primary">
      {{ submitLabel || 'Submit' }}
    </button>
  </form>
</template>

<script setup lang="ts">
  import {
    ref,
    onMounted
  } from 'vue';
  import {
    useVueDirectus
  } from '@meeovi/directus-client';
  import {
    generateFieldSchema,
    createFormEngine
  } from '@meeovi/directus-client';

  const props = defineProps < {
    collection: string;
    submitLabel ? : string;
  } > ();

  const emit = defineEmits(['submitted']);

  const directus = useVueDirectus();
  const loading = ref(true);
  const schema = ref < any[] > ([]);
  const engine = ref < any > (null);

  onMounted(async () => {
    const fields = await directus.client.request(
      directus.readFieldsByCollection(props.collection)
    );

    schema.value = generateFormSchema(fields);

    engine.value = createFormEngine(
      props.collection,
      fields,
      directus, {
        clearOnSuccess: false
      }
    );

    loading.value = false;
  });

  async function submit() {
    const result = await engine.value.submit();
    emit('submitted', result);
  }
</script>
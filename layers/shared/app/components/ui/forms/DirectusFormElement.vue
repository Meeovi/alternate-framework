<template>
  <div v-if="loading">Loading form…</div>

  <v-form v-else @submit.prevent="submit" class="space-y-4">
    <FormField v-for="field in schema" :key="field.key" :field="field" :form="engine.form" />

    <v-btn type="submit" class="btn-primary">
      {{ submitLabel || 'Submit' }}
    </v-btn>
  </v-form>
</template>

<script setup lang="ts">
  import {
    ref,
    onMounted
  } from '#imports';
  // Resolve directus helpers at runtime (provided by a higher-level layer)
  const useVueDirectus = (globalThis as any).useVueDirectus ?? (() => ({ client: { request: async () => [] }, readFieldsByCollection: () => '', readItems: () => [] }))
  const generateFieldSchema = (globalThis as any).generateFieldSchema ?? ((fields: any[]) => [])
  const createFormEngine = (globalThis as any).createFormEngine ?? (() => ({ submit: async () => ({}) }))

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

    schema.value = generateFieldSchema(fields);

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
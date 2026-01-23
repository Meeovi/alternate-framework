<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { generateFormSchema, createFormEngine } from '@meeovi/directus-client';
import { useDirectus } from '../composables/useDirectus';

const props = defineProps<{
  collection: string;
  submitLabel?: string;
}>();

const emit = defineEmits(['submitted']);

const directus = useDirectus();
const loading = ref(true);
const schema = ref<any[]>([]);
const engine = ref<any>(null);

onMounted(async () => {
  const fields = await directus.request(
    directus.readFieldsByCollection(props.collection)
  );

  schema.value = generateFormSchema(fields);

  engine.value = createFormEngine(
    props.collection,
    fields,
    directus,
    { clearOnSuccess: false }
  );

  loading.value = false;
});

async function submit() {
  const result = await engine.value.submit();
  emit('submitted', result);
}
</script>


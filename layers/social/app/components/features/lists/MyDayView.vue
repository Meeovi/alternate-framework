<template>
  <v-navigation-drawer
    v-model="open"
    location="right"
    width="360"
    temporary
  >
    <v-toolbar flat>
      <v-toolbar-title>Task details</v-toolbar-title>
      <v-spacer />
      <v-btn icon="mdi-close" @click="open = false" />
    </v-toolbar>

    <v-card flat>
      <v-card-text v-if="task">
        <v-text-field v-model="local.title" label="Title" />
        <v-textarea v-model="local.notes" label="Notes" rows="3" />
        <v-select
          v-model="local.priority"
          :items="['low', 'medium', 'high']"
          label="Priority"
        />
        <v-text-field
          v-model="local.dueDate"
          label="Due date"
          type="date"
        />
        <v-switch
          v-model="local.completed"
          label="Completed"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="reset">Reset</v-btn>
        <v-btn color="primary" @click="save">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-navigation-drawer>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useLists } from '@/layers/social/composables/useLists'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  task: { type: Object, default: null }
})
const emit = defineEmits(['update:modelValue', 'saved'])

const open = ref(props.modelValue)
watch(() => props.modelValue, v => (open.value = v))
watch(open, v => emit('update:modelValue', v))

const local = ref<any>({})
watch(
  () => props.task,
  t => {
    local.value = t ? { ...t } : {}
  },
  { immediate: true }
)

const { updateListItem } = useLists()

const reset = () => {
  local.value = props.task ? { ...props.task } : {}
}

const save = async () => {
  if (!props.task) return
  await updateListItem(props.task.id, local.value)
  emit('saved', local.value)
}
</script>

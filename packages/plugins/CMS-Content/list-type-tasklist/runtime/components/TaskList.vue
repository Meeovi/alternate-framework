<template>
  <v-sheet class="task-list pa-4">
    <v-toolbar flat density="compact">
      <v-toolbar-title>Tasks</v-toolbar-title>
      <v-spacer />
      <v-btn
        v-if="!readonly"
        color="primary"
        prepend-icon="fas fa-plus"
        variant="elevated"
        @click="openDialog()"
      >
        Add Task
      </v-btn>
    </v-toolbar>

    <v-list v-if="tasks.length" lines="two">
      <v-list-item v-for="task in tasks" :key="task.id">
        <template v-slot:prepend>
          <v-checkbox-btn
            :model-value="task.status === 2"
            @update:model-value="toggleStatus(task, $event)"
          />
        </template>

        <v-list-item-title :class="{ 'text-decoration-line-through': task.status === 2 }">
          {{ task.content || 'Untitled Task' }}
        </v-list-item-title>
        <v-list-item-subtitle v-if="task.notes">
          {{ task.notes }}
        </v-list-item-subtitle>

        <template v-slot:append>
          <v-btn
            v-if="!readonly"
            icon
            size="small"
            variant="text"
            @click="openDialog(task)"
          >
            <v-icon>fas fa-pen</v-icon>
          </v-btn>
          <v-btn
            v-if="!readonly"
            icon
            size="small"
            variant="text"
            color="error"
            @click="confirmDelete(task)"
          >
            <v-icon>fas fa-trash</v-icon>
          </v-btn>
        </template>
      </v-list-item>
    </v-list>

    <v-alert v-else type="info" variant="tonal" class="ma-4">
      This list doesn't have any items yet.
    </v-alert>

    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-card-title>{{ editingTask ? 'Edit Task' : 'Add Task' }}</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="form.content"
            label="Content"
            auto-focus
          />
          <v-textarea
            v-model="form.notes"
            label="Notes"
            rows="2"
          />
          <v-select
            v-model="form.status"
            :items="statusOptions"
            label="Status"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="dialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="elevated" @click="saveTask">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title>Delete Task</v-card-title>
        <v-card-text>
          Are you sure you want to delete "{{ deletingTask?.content || 'this task' }}"?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" variant="elevated" @click="deleteTask">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-sheet>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRuntimeConfig } from '#imports'
import { useListItemsClient } from '../composables/useListItemsClient'

const { listId, readonly = false } = defineProps<{
  listId: string | number
  items?: unknown[]
  readonly?: boolean
}>()
const COLLECTION = (useRuntimeConfig().public.listTypeTaskList as any)?.collection || 'list_items'
const { readItems, createItem, updateItem, deleteItem } = useListItemsClient()

const tasks = ref<any[]>([])
const dialog = ref(false)
const deleteDialog = ref(false)
const editingTask = ref<any | null>(null)
const deletingTask = ref<any | null>(null)
const form = ref({
  content: '',
  notes: '',
  status: 0
})

const statusOptions = [
  { title: 'Pending', value: 0 },
  { title: 'In Progress', value: 1 },
  { title: 'Done', value: 2 }
]

// list_items' real columns are list_id/title/description/position (not
// list/content/notes/sort) — Directus silently drops unknown fields on
// create instead of erroring, so the old field names here were writing
// orphaned rows with list_id left null, and the read filter matched
// nothing because `list` doesn't exist as a column to filter on.
function toTask(r: any) {
  return {
    id: r.id,
    content: r.title ?? '',
    notes: r.description ?? '',
    status: r.status ?? 0,
    sort: r.position ?? 0
  }
}

async function loadItems() {
  const records = await readItems(COLLECTION, {
    fields: ['id', 'title', 'description', 'status', 'position'],
    filter: { list_id: { _eq: listId } },
    sort: ['position']
  }) || []

  tasks.value = records.map(toTask)
}

function openDialog(task: any = null) {
  editingTask.value = task
  if (task) {
    form.value = {
      content: task.content || '',
      notes: task.notes || '',
      status: task.status ?? 0
    }
  } else {
    form.value = { content: '', notes: '', status: 0 }
  }
  dialog.value = true
}

async function saveTask() {
  if (editingTask.value) {
    const updated = await updateItem(COLLECTION, editingTask.value.id, {
      title: form.value.content,
      description: form.value.notes,
      status: form.value.status
    })
    const task = toTask(updated)
    const index = tasks.value.findIndex((t) => t.id === task.id)
    if (index !== -1) tasks.value[index] = task
  } else {
    const created = await createItem(COLLECTION, {
      list_id: listId,
      title: form.value.content,
      description: form.value.notes,
      status: form.value.status
    })
    // Append locally instead of re-fetching the whole list — the new
    // task appears immediately without a round trip back through
    // loadItems().
    tasks.value = [...tasks.value, toTask(created)]
  }
  dialog.value = false
}

function confirmDelete(task: any) {
  deletingTask.value = task
  deleteDialog.value = true
}

async function deleteTask() {
  if (deletingTask.value) {
    await deleteItem(COLLECTION, deletingTask.value.id)
    tasks.value = tasks.value.filter((t) => t.id !== deletingTask.value.id)
    deleteDialog.value = false
    deletingTask.value = null
  }
}

async function toggleStatus(task: any, checked: boolean) {
  const newStatus = checked ? 2 : 0
  await updateItem(COLLECTION, task.id, { status: newStatus })
  task.status = newStatus
}

onMounted(loadItems)
</script>

<style scoped>
.task-list {
  border-radius: 8px;
}
</style>

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
import { useLists } from '../../../../composables/lists/useLists'

const { listId, readonly = false } = defineProps<{
  listId: string | number
  readonly?: boolean
}>()
const { updateListItem, deleteListItem } = useLists()
const { $directus, $readItems, $createItem, $updateItem, $deleteItem } = useNuxtApp() as any

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

async function loadItems() {
  const records = await $directus.request($readItems('list_items', {
    fields: ['id', 'content', 'notes', 'status', 'sort'],
    filter: { list: { _eq: listId } },
    sort: ['sort']
  })) || []

  tasks.value = records.map((r: any) => ({
    id: r.id,
    content: r.content ?? '',
    notes: r.notes ?? '',
    status: r.status ?? 0,
    sort: r.sort ?? 0
  }))
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
    await $directus.request($updateItem('list_items', editingTask.value.id, {
      content: form.value.content,
      notes: form.value.notes,
      status: form.value.status
    }))
  } else {
    await $directus.request($createItem('list_items', {
      list: listId,
      content: form.value.content,
      notes: form.value.notes,
      status: form.value.status
    }))
  }
  dialog.value = false
  await loadItems()
}

function confirmDelete(task: any) {
  deletingTask.value = task
  deleteDialog.value = true
}

async function deleteTask() {
  if (deletingTask.value) {
    await $directus.request($deleteItem('list_items', deletingTask.value.id))
    deleteDialog.value = false
    deletingTask.value = null
    await loadItems()
  }
}

async function toggleStatus(task: any, checked: boolean) {
  const newStatus = checked ? 2 : 0
  await updateListItem(task.id, { status: newStatus })
  task.status = newStatus
}

onMounted(loadItems)
</script>

<style scoped>
.task-list {
  border-radius: 8px;
}
</style>

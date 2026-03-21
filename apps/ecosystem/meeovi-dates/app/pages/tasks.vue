<template>
  <v-container class="py-8" fluid>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title>
            <span class="text-h5">Tasks</span>
            <v-spacer />
            <v-btn color="primary" @click="showTaskDialog = true">Add Task</v-btn>
          </v-card-title>
          <v-divider />
          <v-list>
            <v-list-item v-for="task in tasks" :key="task.id">
              <template v-slot:default>
                <v-list-item-content>
                  <v-list-item-title>{{ task.title }}</v-list-item-title>
                  <v-list-item-subtitle>{{ task.description }}</v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <v-btn icon @click="editTask(task)" size="small">
                    <v-icon icon="fa:fas fa-pencil" size="small"></v-icon>
                  </v-btn>
                  <v-btn icon @click="deleteTask(task.id)" size="small">
                    <v-icon icon="fa:fas fa-x" size="small"></v-icon>
                  </v-btn>
                </v-list-item-action>
              </template>
            </v-list-item>
            <v-list-item v-if="tasks.length === 0">
              <v-list-item-content>
                <v-list-item-title>No tasks found.</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
    
    <!-- Task Dialog -->
    <v-dialog v-model="showTaskDialog" max-width="500">
      <v-card>
        <v-card-title>{{ editingTask ? 'Edit Task' : 'Add Task' }}</v-card-title>
        <v-card-text>
          <v-text-field 
            v-model="taskForm.title" 
            label="Title" 
            required 
            :error-messages="titleErrors"
          />
          <v-textarea v-model="taskForm.description" label="Description" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="closeDialog">Cancel</v-btn>
          <v-btn color="primary" @click="saveTask" :loading="saving">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- Error Snackbar -->
    <v-snackbar v-model="showError" color="error" top timeout="5000">
      {{ errorMsg }}
      <template v-slot:action="{ attrs }">
        <v-btn color="white" text v-bind="attrs" @click="showError = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
    
    <!-- Success Snackbar -->
    <v-snackbar v-model="showSuccess" color="success" top timeout="3000">
      {{ successMsg }}
    </v-snackbar>
    
    <!-- Loading Overlay -->
    <v-overlay v-model="loading">
      <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
    </v-overlay>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useNuxtApp } from '#app'

const {
  $directus,
  $readItems,
  $createItem,
  $updateItem,
  $deleteItem
} = useNuxtApp()

// Reactive state
const tasks = ref([])
const showTaskDialog = ref(false)
const editingTask = ref(null)
const taskForm = ref({ title: '', description: '' })
const errorMsg = ref('')
const successMsg = ref('')
const showError = ref(false)
const showSuccess = ref(false)
const loading = ref(false)
const saving = ref(false)

// Form validation
const titleErrors = computed(() => {
  const errors = []
  if (!taskForm.value.title && showTaskDialog.value) {
    errors.push('Title is required')
  }
  return errors
})

// Helper function to show error
function showErrorMessage(message) {
  errorMsg.value = message
  showError.value = true
}

// Helper function to show success
function showSuccessMessage(message) {
  successMsg.value = message
  showSuccess.value = true
}

// Fetch all tasks
async function fetchTasks() {
  loading.value = true
  try {
    const response = await $directus.request(
      $readItems('tasks', {
        sort: ['-date_created'],
        limit: -1
      })
    )
    tasks.value = response || []
  } catch (error) {
    console.error('Error fetching tasks:', error)
    showErrorMessage('Failed to load tasks. Please try again.')
    tasks.value = []
  } finally {
    loading.value = false
  }
}

// Open edit dialog
function editTask(task) {
  editingTask.value = task
  taskForm.value = { 
    title: task.title || '', 
    description: task.description || '' 
  }
  showTaskDialog.value = true
}

// Close dialog and reset form
function closeDialog() {
  showTaskDialog.value = false
  editingTask.value = null
  taskForm.value = { title: '', description: '' }
}

// Save task (create or update)
async function saveTask() {
  // Validate form
  if (!taskForm.value.title?.trim()) {
    showErrorMessage('Title is required.')
    return
  }

  saving.value = true
  
  try {
    const taskData = {
      title: taskForm.value.title.trim(),
      description: taskForm.value.description?.trim() || ''
    }

    if (editingTask.value) {
      // Update existing task
      await $directus.request(
        $updateItem('tasks', editingTask.value.id, taskData)
      )
      showSuccessMessage('Task updated successfully!')
    } else {
      // Create new task
      await $directus.request(
        $createItem('tasks', taskData)
      )
      showSuccessMessage('Task created successfully!')
    }
    
    closeDialog()
    await fetchTasks()
    
  } catch (error) {
    console.error('Error saving task:', error)
    const message = error?.errors?.[0]?.message || error?.message || 'Failed to save task. Please try again.'
    showErrorMessage(message)
  } finally {
    saving.value = false
  }
}

// Delete task with confirmation
async function deleteTask(id) {
  if (!confirm('Are you sure you want to delete this task?')) {
    return
  }

  loading.value = true
  
  try {
    await $directus.request($deleteItem('tasks', id))
    showSuccessMessage('Task deleted successfully!')
    await fetchTasks()
  } catch (error) {
    console.error('Error deleting task:', error)
    const message = error?.errors?.[0]?.message || error?.message || 'Failed to delete task. Please try again.'
    showErrorMessage(message)
  } finally {
    loading.value = false
  }
}

// Initialize component
onMounted(() => {
  fetchTasks()
})

// Set page title
useHead({
  title: 'Meeovi Tasks',
})

// Expose methods for testing/external access
defineExpose({
  tasks,
  showTaskDialog,
  editingTask,
  taskForm,
  editTask,
  closeDialog,
  saveTask,
  deleteTask,
  fetchTasks
})
</script>

<style scoped>
.v-list-item-action {
  display: flex;
  gap: 8px;
}
</style>


<template>
  <v-card 
    :class="{ 'task-completed': task.completed }"
    class="task-item mb-2"
    variant="outlined"
  >
    <v-card-text class="py-2">
      <div class="d-flex align-center">
        <v-checkbox
          :model-value="task.completed"
          @update:model-value="toggleComplete"
          hide-details
          class="me-3"
        />
        
        <div class="grow">
          <div 
            :class="{ 'text-decoration-line-through text-medium-emphasis': task.completed }"
            class="task-title"
          >
            {{ task.title }}
          </div>
          
          <div v-if="task.description" class="text-body-2 text-medium-emphasis mt-1">
            {{ task.description }}
          </div>
          
          <div class="d-flex align-center mt-2 flex-wrap ga-2">
            <v-chip
              v-if="task.priority !== 'medium'"
              :color="getPriorityColor(task.priority)"
              size="x-small"
              variant="tonal"
            >
              {{ task.priority }}
            </v-chip>
            
            <v-chip
              v-if="task.due_date"
              :color="getDueDateColor(task.due_date)"
              size="x-small"
              variant="outlined"
              prepend-icon="mdi-calendar"
            >
              {{ formatDueDate(task.due_date) }}
            </v-chip>
            
            <v-chip
              v-for="label in task.labels"
              :key="label"
              size="x-small"
              variant="outlined"
            >
              {{ label }}
            </v-chip>
          </div>
          
          <!-- Subtasks -->
          <div v-if="task.subtasks?.length" class="mt-3">
            <div class="text-caption text-medium-emphasis mb-1">
              Subtasks ({{ completedSubtasks }}/{{ task.subtasks.length }})
            </div>
            <div class="subtasks">
              <div
                v-for="subtask in task.subtasks"
                :key="subtask.id"
                class="d-flex align-center py-1"
              >
                <v-checkbox
                  :model-value="subtask.completed"
                  @update:model-value="toggleSubtask(subtask.id)"
                  hide-details
                  density="compact"
                  class="me-2"
                />
                <span 
                  :class="{ 'text-decoration-line-through text-medium-emphasis': subtask.completed }"
                  class="text-body-2"
                >
                  {{ subtask.title }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="task-actions">
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn
                icon="mdi-dots-vertical"
                variant="text"
                size="small"
                v-bind="props"
              />
            </template>
            
            <v-list>
              <v-list-item @click="$emit('edit', task)">
                <template v-slot:prepend>
                  <v-icon icon="mdi-pencil" />
                </template>
                <v-list-item-title>Edit</v-list-item-title>
              </v-list-item>
              
              <v-list-item @click="$emit('duplicate', task)">
                <template v-slot:prepend>
                  <v-icon icon="mdi-content-copy" />
                </template>
                <v-list-item-title>Duplicate</v-list-item-title>
              </v-list-item>
              
              <v-divider />
              
              <v-list-item @click="$emit('delete', task)" class="text-error">
                <template v-slot:prepend>
                  <v-icon icon="mdi-delete" color="error" />
                </template>
                <v-list-item-title>Delete</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { format, isToday, isTomorrow, isPast } from 'date-fns'

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update', 'edit', 'duplicate', 'delete'])

const completedSubtasks = computed(() => {
  return props.task.subtasks?.filter(st => st.completed).length || 0
})

const toggleComplete = (completed) => {
  emit('update', { ...props.task, completed })
}

const toggleSubtask = (subtaskId) => {
  const subtasks = props.task.subtasks.map(st => 
    st.id === subtaskId ? { ...st, completed: !st.completed } : st
  )
  emit('update', { ...props.task, subtasks })
}

const getPriorityColor = (priority) => {
  const colors = {
    low: 'blue',
    medium: 'orange',
    high: 'red'
  }
  return colors[priority] || 'grey'
}

const getDueDateColor = (dueDate) => {
  if (!dueDate) return 'grey'
  
  const date = new Date(dueDate)
  if (isPast(date) && !isToday(date)) return 'error'
  if (isToday(date)) return 'warning'
  if (isTomorrow(date)) return 'info'
  return 'success'
}

const formatDueDate = (dueDate) => {
  if (!dueDate) return ''
  
  const date = new Date(dueDate)
  if (isToday(date)) return 'Today'
  if (isTomorrow(date)) return 'Tomorrow'
  if (isPast(date)) return `Overdue (${format(date, 'MMM d')})`
  return format(date, 'MMM d')
}
</script>

<style scoped>
.task-completed {
  opacity: 0.7;
}

.task-item {
  transition: all 0.2s ease;
}

.task-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.subtasks {
  border-left: 2px solid rgba(var(--v-theme-primary), 0.2);
  padding-left: 12px;
  margin-left: 8px;
}
</style>
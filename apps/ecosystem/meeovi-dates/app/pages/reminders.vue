<template>
  <v-container class="py-8" fluid>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title>
            <span class="text-h5">Reminders</span>
            <v-spacer />
            <v-btn color="primary" @click="showReminderDialog = true">Add Reminder</v-btn>
          </v-card-title>
          <v-divider />
          <v-list>
            <v-list-item v-for="reminder in reminders" :key="reminder.id">
              <v-list-item-content>
                <v-list-item-title>{{ reminder.title }}</v-list-item-title>
                <v-list-item-subtitle>{{ reminder.date }} - {{ reminder.time }}</v-list-item-subtitle>
                <v-list-item-subtitle>{{ reminder.description }}</v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-btn icon @click="editReminder(reminder)"><v-icon>mdi-pencil</v-icon></v-btn>
                <v-btn icon @click="deleteReminder(reminder.id)"><v-icon>mdi-delete</v-icon></v-btn>
              </v-list-item-action>
            </v-list-item>
            <v-list-item v-if="reminders.length === 0">
              <v-list-item-content>No reminders found.</v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
    <!-- Reminder Dialog -->
    <v-dialog v-model="showReminderDialog" max-width="500">
      <v-card>
        <v-card-title>{{ editingReminder ? 'Edit Reminder' : 'Add Reminder' }}</v-card-title>
        <v-card-text>
          <v-text-field v-model="reminderForm.title" label="Title" required />
          <v-text-field v-model="reminderForm.date" label="Date" type="date" required />
          <v-text-field v-model="reminderForm.time" label="Time" type="time" required />
          <v-textarea v-model="reminderForm.description" label="Description" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="closeDialog">Cancel</v-btn>
          <v-btn color="primary" @click="saveReminder">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useNuxtApp } from '#app'

const { $directus, $readItems, $createItem, $deleteItem } = useNuxtApp()

const reminders = ref([])
const showReminderDialog = ref(false)
const editingReminder = ref(null)
const reminderForm = ref({ title: '', date: '', time: '', description: '' })

async function fetchReminders() {
  try {
    const res = await $readItems('reminders')
    reminders.value = res
  } catch (e) {
    reminders.value = []
  }
}

function editReminder(reminder) {
  editingReminder.value = reminder
  reminderForm.value = { ...reminder }
  showReminderDialog.value = true
}

function closeDialog() {
  showReminderDialog.value = false
  editingReminder.value = null
  reminderForm.value = { title: '', date: '', time: '', description: '' }
}

async function saveReminder() {
  try {
    if (editingReminder.value) {
      await $directus.items('reminders').updateOne(editingReminder.value.id, reminderForm.value)
    } else {
      await $createItem('reminders', reminderForm.value)
    }
    closeDialog()
    fetchReminders()
  } catch (e) {}
}

async function deleteReminder(id) {
  try {
    await $deleteItem('reminders', id)
    fetchReminders()
  } catch (e) {}
}

onMounted(fetchReminders)

defineExpose({
  reminders,
  showReminderDialog,
  editingReminder,
  reminderForm,
  editReminder,
  closeDialog,
  saveReminder,
  deleteReminder
})

useHead({
  title: 'Meeovi Scheduler',
})
</script>
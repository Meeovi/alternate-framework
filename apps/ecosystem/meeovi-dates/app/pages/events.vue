<template>
  <v-container class="py-8" fluid>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title>
            <span class="text-h5">Events</span>
            <v-spacer />
            <v-btn color="primary" @click="showEventDialog = true">Add Event</v-btn>
          </v-card-title>
          <v-divider />
          <v-list>
            <v-list-item v-for="event in events" :key="event.id">
              <div>
                <v-list-item-title>{{ event.name }}</v-list-item-title>
                <v-list-item-subtitle>{{ event.date }} - {{ event.location }}</v-list-item-subtitle>
                <v-list-item-subtitle>{{ event.description }}</v-list-item-subtitle>
              </div>
              <v-list-item-action>
                <v-btn icon @click="editEvent(event)"><v-icon>mdi-pencil</v-icon></v-btn>
                <v-btn icon @click="deleteEvent(event.id)"><v-icon>mdi-delete</v-icon></v-btn>
              </v-list-item-action>
            </v-list-item>
            <v-list-item v-if="events.length === 0">
              <div>No events found.</div>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
    <!-- Event Dialog -->
    <v-dialog v-model="showEventDialog" max-width="500">
      <v-card>
        <v-card-title>{{ editingEvent ? 'Edit Event' : 'Add Event' }}</v-card-title>
        <v-card-text>
          <v-text-field v-model="eventForm.name" label="Title" required />
          <v-text-field v-model="eventForm.date" label="Date" type="date" required />
          <v-text-field v-model="eventForm.location" label="Location" />
          <v-textarea v-model="eventForm.description" label="Description" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="closeDialog">Cancel</v-btn>
          <v-btn color="primary" @click="saveEvent">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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

const events = ref([])
const showEventDialog = ref(false)
const editingEvent = ref(null)
const eventForm = ref({ name: '', date: '', location: '', description: '' })

async function fetchEvents() {
  try {
    const res = await $readItems('events')
    events.value = res
  } catch (e) {
    events.value = []
  }
}

function editEvent(event) {
  editingEvent.value = event
  eventForm.value = { ...event }
  showEventDialog.value = true
}

function closeDialog() {
  showEventDialog.value = false
  editingEvent.value = null
  eventForm.value = { name: '', date: '', location: '', description: '' }
}

async function saveEvent() {
  try {
    if (editingEvent.value) {
      await $directus.items('events').$updateItem(editingEvent.value.id, eventForm.value)
    } else {
      await $createItem('events', eventForm.value)
    }
    closeDialog()
    await fetchEvents() // Smoothly refresh events list
  } catch (e) {}
}

async function deleteEvent(id) {
  try {
    await $deleteItem('events', id)
    fetchEvents()
  } catch (e) {}
}

// Google Calendar Integration
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID';
const GOOGLE_API_KEY = 'YOUR_GOOGLE_API_KEY';
const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

function loadGoogleApi() {
  return new Promise((resolve) => {
    if (window.gapi) return resolve(window.gapi);
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
      window.gapi.load('client:auth2', () => resolve(window.gapi));
    };
    document.body.appendChild(script);
  });
}

async function connectGoogleCalendar() {
  const gapi = await loadGoogleApi();
  await gapi.client.init({
    apiKey: GOOGLE_API_KEY,
    clientId: GOOGLE_CLIENT_ID,
    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
    scope: GOOGLE_SCOPES,
  });
  await gapi.auth2.getAuthInstance().signIn();
  const response = await gapi.client.calendar.events.list({
    calendarId: 'primary',
    timeMin: new Date().toISOString(),
    showDeleted: false,
    singleEvents: true,
    maxResults: 10,
    orderBy: 'startTime',
  });
  // Map Google events to your events list or display as needed
  console.log('Google Events:', response.result.items);
}

// Microsoft Calendar Integration
const MS_CLIENT_ID = 'YOUR_MICROSOFT_CLIENT_ID';
const MS_SCOPES = ['Calendars.Read'];

function loadMicrosoftApi() {
  return new Promise((resolve) => {
    if (window.msal) return resolve(window.msal);
    const script = document.createElement('script');
    script.src = 'https://alcdn.msauth.net/browser/2.32.0/js/msal-browser.min.js';
    script.onload = () => resolve(window.msal);
    document.body.appendChild(script);
  });
}

async function connectMicrosoftCalendar() {
  const msal = await loadMicrosoftApi();
  const msalInstance = new msal.PublicClientApplication({
    auth: { clientId: MS_CLIENT_ID },
  });
  const loginResponse = await msalInstance.loginPopup({ scopes: MS_SCOPES });
  const accessToken = loginResponse.accessToken;
  const response = await fetch('https://graph.microsoft.com/v1.0/me/events', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await response.json();
  // Map Microsoft events to your events list or display as needed
  console.log('Microsoft Events:', data.value);
}

onMounted(fetchEvents)

defineExpose({
  events,
  showEventDialog,
  editingEvent,
  eventForm,
  editEvent,
  closeDialog,
  saveEvent,
  deleteEvent
})

useHead({
  title: 'Meeovi Events',
})
</script>

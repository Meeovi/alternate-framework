<template>
  <v-app>
    <v-main>
      <v-container fluid class="fill-height pa-0">
        <v-row class="fill-height" align="center" justify="center">
          <v-col cols="12">
            <v-sheet class="pa-0" height="100vh">
              <v-calendar
                ref="calendar"
                v-model="calendarValue"
                :type="calendarType"
                color="primary"
                :events="calendarEvents"
                @click:event="onEventClick"
                @change="onCalendarChange"
                :now="today"
                :weekdays="[0,1,2,3,4,5,6]"
                :short-weekdays="false"
                :show-adjacent-months="true"
                :show-week="true"
                :min-weeks="6"
                :max-weeks="6"
                :first-interval="0"
                :interval-count="24"
                :interval-minutes="60"
                :interval-format="interval => `${interval}:00`"
              />
              <v-btn class="mt-4" color="secondary" @click="connectGoogle">Connect Google Calendar</v-btn>
              <v-btn class="mt-4 ml-2" color="info" @click="connectMicrosoft">Connect Microsoft Calendar</v-btn>
            </v-sheet>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
import { useNuxtApp } from '#app'

const calendarValue = ref(new Date().toISOString().substr(0, 10))
const calendarType = ref('month')
const today = ref(new Date().toISOString().substr(0, 10))
const calendarEvents = ref([])

function onEventClick({ event }) {
  // Show event details or open event
}

function onCalendarChange(value) {
  // Handle calendar navigation
}

function connectGoogle() {
  // Placeholder for Google Calendar OAuth
  alert('Google Calendar integration coming soon!')
}

function connectMicrosoft() {
  // Placeholder for Microsoft Calendar OAuth
  alert('Microsoft Calendar integration coming soon!')
}

useHead({
  title: 'Meeovi Dates',
})
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
}

:deep(.v-calendar-daily__day, .v-calendar-month__day) {
  .v-btn {
    background: none !important;
    box-shadow: none !important;
    border-radius: 50% !important;
  }
}

:deep(.v-calendar-daily__day--today .v-btn,
      .v-calendar-month__day--today .v-btn) {
  background: #1976d2 !important; /* Vuetify primary color */
  color: #fff !important;
}
</style>
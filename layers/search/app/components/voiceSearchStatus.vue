<script setup lang="ts">
  import { computed, watch } from 'vue'

  // Rendered inside <ais-voice-search>'s slot, which is the only place its
  // listening state is available. Shows what the microphone is doing and
  // reports the finished phrase, so the search bar can go to the results:
  // before, the spoken words only filled the box and nothing else happened,
  // and a blocked microphone or "didn't hear anything" failed silently.
  const props = defineProps<{
    state?: { status?: string, transcript?: string, errorCode?: string }
  }>()
  const emit = defineEmits<{ heard: [transcript: string] }>()

  const ERRORS: Record<string, string> = {
    'not-allowed': 'Microphone blocked: allow it for this site in your browser',
    'service-not-allowed': 'Voice search is turned off in this browser',
    'no-speech': "Didn't hear anything, try again",
    'audio-capture': 'No microphone found',
    network: "Voice search couldn't connect, try again",
  }

  const message = computed(() => {
    const s = props.state
    if (s?.status === 'askingPermission') return 'Allow the microphone to search by voice'
    if (s?.status === 'waiting' || s?.status === 'recognizing') return s.transcript ? `“${s.transcript}”` : 'Listening…'
    if (s?.status === 'error') return ERRORS[s.errorCode || ''] || 'Voice search stopped, try again'
    return ''
  })

  watch(() => props.state?.status, (status) => {
    const transcript = props.state?.transcript?.trim()
    if (status === 'finished' && transcript) emit('heard', transcript)
  })
</script>

<template>
  <!-- A tooltip, because it renders in Vuetify's overlay layer: a box placed
       under the field was clipped by the app bar. -->
  <v-tooltip :model-value="Boolean(message)" activator="parent" location="bottom" :open-on-hover="false"
    :open-on-focus="false" :open-on-click="false">
    <span class="voice-status" :class="{ 'voice-status--error': state?.status === 'error' }">{{ message }}</span>
  </v-tooltip>
  <span class="voice-status__live" role="status" aria-live="polite">{{ message }}</span>
</template>

<style scoped>
  .voice-status--error {
    color: #ffb4ab; /* light red: readable on the dark tooltip */
    font-weight: 500;
  }

  .voice-status__live {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
</style>

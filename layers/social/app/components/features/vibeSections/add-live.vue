<template>
  <v-row justify="center">
      <v-card class="b-1">
        <v-card-title>
          <h3>Create New Live</h3>
        </v-card-title>

        <v-card-text>
          <section class="mb-6">
            <div class="text-subtitle-2 mb-2">Record yourself</div>
            <div class="text-body-2 text-medium-emphasis mb-3">
              Start a recording, review it here, then save it to the backend.
            </div>

            <div v-if="recordingError" class="error mb-3">{{ recordingError }}</div>

            <div class="d-flex flex-wrap ga-3 mb-3">
              <v-btn
                color="primary"
                :disabled="!recordingSupported || recording || submitting"
                @click="startRecording"
              >
                Start Recording
              </v-btn>
              <v-btn
                color="error"
                variant="tonal"
                :disabled="!recording"
                @click="stopRecording"
              >
                Stop Recording
              </v-btn>
              <v-btn
                variant="text"
                :disabled="!recordedVideoUrl || submitting"
                @click="clearRecording"
              >
                Clear Recording
              </v-btn>
            </div>

            <div v-if="!recordingSupported" class="text-body-2 text-medium-emphasis mb-3">
              Recording is not supported in this browser.
            </div>

            <v-responsive
              v-show="recording || cameraStream || recordedVideoUrl"
              aspect-ratio="16/9"
              class="rounded-lg overflow-hidden bg-black"
            >
              <video
                ref="previewEl"
                class="w-100 h-100"
                autoplay
                muted
                playsinline
                controls
              />
            </v-responsive>
          </section>

          <DynamicForm collection="shorts" />
        </v-card-text>
      </v-card>
  </v-row>
</template>

<script setup>
import { ref } from '#imports'
import { DynamicForm } from '@mframework/meeovi-forms'
import useCreateLiveShort from '../../../composables/vibez/useCreateLiveShort'

const dialog = ref(false)

const {
  form,
  formError,
  formSuccess,
  shortFields,
  pending,
  error,
  recordingError,
  recordingSupported,
  recording,
  submitting,
  recordedVideoUrl,
  cameraStream,
  previewEl,
  startRecording,
  stopRecording,
  clearRecording,
  submitForm,
} = await useCreateLiveShort(dialog)
</script>
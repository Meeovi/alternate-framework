<template>
  <section class="pa-4 max-w-md mx-auto">
    <h2 class="text-h5 mb-4">Approve Device</h2>

    <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
      {{ error }}
    </v-alert>

    <v-alert v-if="message" type="success" variant="tonal" class="mb-4">
      {{ message }}
    </v-alert>

    <v-form @submit.prevent="handleApprove">
      <v-text-field
        v-model="userCode"
        label="Device Code"
        variant="outlined"
        readonly
        class="mb-4"
      />

      <v-btn color="primary" :loading="loading" type="submit">
        Approve Device
      </v-btn>
    </v-form>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { useRoute, useRouter } from "#app"
import { useDevice } from "../../../composables/device/useDevice"

const route = useRoute()
const router = useRouter()
const { approveDevice, loading, error, message } = useDevice()

const userCode = ref(route.query.user_code?.toString() || "")

async function handleApprove() {
  await approveDevice(userCode.value)

  if (!error.value) {
    setTimeout(() => router.push("/devices"), 1200)
  }
}
</script>

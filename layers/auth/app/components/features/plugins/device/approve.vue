<template>
  <section class="pa-4 max-w-md mx-auto">
    <h2 class="text-h5 mb-4">Approve Device</h2>

    <v-alert v-if="errorMsg" type="error" variant="tonal" class="mb-4">
      {{ errorMsg }}
    </v-alert>

    <v-alert v-if="successMsg" type="success" variant="tonal" class="mb-4">
      {{ successMsg }}
    </v-alert>

    <v-form @submit.prevent="handleApprove">
      <v-text-field
        v-model="userCode"
        label="Device Code"
        variant="outlined"
        readonly
        class="mb-4"
      />

      <v-btn color="primary" :loading="isProcessing" type="submit">
        Approve Device
      </v-btn>
    </v-form>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { useRoute, useRouter } from "#imports"
import { useDeviceAuth } from "../../../../composables/device/useDeviceAuth"

const route = useRoute()
const router = useRouter()
const { approveDevice, isProcessing, errorMsg, successMsg } = useDeviceAuth()

const userCode = ref(route.query.user_code?.toString() || "")

async function handleApprove() {
  await approveDevice(userCode.value)

  if (!errorMsg.value) {
    setTimeout(() => router.push("/devices"), 1200)
  }
}
</script>

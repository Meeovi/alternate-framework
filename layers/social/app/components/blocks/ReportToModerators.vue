<template>
  <div class="d-inline-block">
    <v-btn variant="text" color="inherit" size="small" prepend-icon="fas fa-flag" @click="open">
      {{ label }}
    </v-btn>

    <v-dialog v-model="dialog" max-width="520">
      <v-card>
        <v-card-title class="text-wrap">Report this {{ subject.kind === 'note' ? 'note' : 'account' }}</v-card-title>
        <v-card-subtitle class="text-wrap">Meeovi's moderators review every report.</v-card-subtitle>

        <v-card-text v-if="!sent">
          <v-radio-group v-model="reasonType" hide-details class="mb-3">
            <v-radio v-for="option in REASONS" :key="option.value" :value="option.value" :label="option.title" />
          </v-radio-group>
          <v-textarea v-model="details" label="Anything else moderators should know (optional)" rows="3" auto-grow
            maxlength="1500" counter density="comfortable" />
          <v-alert v-if="error" type="error" variant="tonal" density="compact">{{ error }}</v-alert>
        </v-card-text>
        <v-card-text v-else>
          <v-alert type="success" variant="tonal">Thanks, your report has been sent to Meeovi's moderators.</v-alert>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialog = false">{{ sent ? 'Close' : 'Cancel' }}</v-btn>
          <v-btn v-if="!sent" color="primary" :disabled="!reasonType" :loading="sending" @click="send">Send report</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { navigateTo, useRoute } from '#imports'
import { useSocialStore } from '../../stores/social'

/**
 * Report a Bluesky note or account to Meeovi's moderators (a report in
 * Meeovi's Ozone, via POST /api/social/moderation/report). Signed-out
 * visitors are sent to sign in first.
 *
 *   <ReportToModerators network="atproto" :subject="{ kind: 'note', id: note.id }" />
 */
const props = withDefaults(defineProps<{
  network: string
  subject: { kind: 'note' | 'account', id: string }
  label?: string
}>(), { label: 'Report' })

const REASONS = [
  { value: 'spam', title: 'Spam or unwanted promotion' },
  { value: 'misleading', title: 'Misleading, a scam or impersonation' },
  { value: 'sexual', title: 'Unlabelled adult content' },
  { value: 'rude', title: 'Harassment, hate or abuse' },
  { value: 'violation', title: 'Illegal or against the rules' },
  { value: 'other', title: 'Something else' },
]

const route = useRoute()
const dialog = ref(false)
const reasonType = ref<string | null>(null)
const details = ref('')
const sending = ref(false)
const sent = ref(false)
const error = ref('')

const open = async () => {
  const session = await useSocialStore().fetchSession().catch(() => null)
  if (!session) return navigateTo({ path: '/login', query: { redirect: route.fullPath } })
  sent.value = false
  error.value = ''
  dialog.value = true
}

const send = async () => {
  sending.value = true
  error.value = ''
  try {
    await $fetch('/api/social/moderation/report', {
      method: 'POST',
      body: { network: props.network, subject: props.subject, reasonType: reasonType.value, details: details.value || undefined },
    })
    sent.value = true
    reasonType.value = null
    details.value = ''
  } catch (e: any) {
    error.value = e?.data?.statusMessage || e?.statusMessage || "Your report couldn't be sent. Please try again."
  } finally {
    sending.value = false
  }
}
</script>

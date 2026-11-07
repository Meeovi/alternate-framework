<template>
  <div v-if="state?.available" class="fediverse-settings">
    <v-switch
      :model-value="state.enabled"
      color="primary"
      inset
      hide-details
      :loading="saving"
      :disabled="saving || !state.handle"
      :label="state.handle ? `Let people on the fediverse follow me as ${state.handle}` : 'Let people on the fediverse follow me'"
      @update:model-value="save({ enabled: !!$event, shop: state.shop })"
    />
    <p class="text-caption text-medium-emphasis mt-1">
      People on Mastodon, Pixelfed, Threads and other fediverse apps can follow you. They see your profile, the public
      notes, vibez and public lists you post from now on, and can reply, like and boost. Replies show in your notes'
      discussions. Turning this off removes your account from the fediverse.
    </p>
    <p v-if="!state.handle" class="text-caption mt-1">Choose a username first: it becomes your fediverse handle.</p>
    <p v-if="state.enabled" class="text-caption mt-1">
      {{ state.followers }} {{ state.followers === 1 ? 'follower' : 'followers' }} on the fediverse.
    </p>

    <template v-if="state.seller">
      <v-switch
        :model-value="state.shop"
        color="primary"
        inset
        hide-details
        class="mt-2"
        :loading="saving"
        :disabled="saving || !state.enabled"
        :label="`Let people follow my shop as ${state.shopHandle}`"
        @update:model-value="save({ enabled: state.enabled, shop: !!$event })"
      />
      <p class="text-caption text-medium-emphasis mt-1">
        Your shop posts your new products, with a picture and a link, and Meeovi's own account boosts them.
        <template v-if="state.shop"> {{ state.shopFollowers }} {{ state.shopFollowers === 1 ? 'follower' : 'followers' }}.</template>
      </p>
    </template>
    <p v-if="error" class="text-caption text-error mt-1">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

/**
 * "Let people on the fediverse follow me" (ActivityPub — layers/social
 * server/utils/activitypub): the member's profile and public content as
 * @username@meeovi.com, and for sellers their shop as @shop-username.
 */
type State = {
  available: boolean
  enabled: boolean
  shop: boolean
  seller: boolean
  handle: string | null
  shopHandle: string | null
  followers: number
  shopFollowers: number
}

const state = ref<State | null>(null)
const saving = ref(false)
const error = ref('')

onMounted(async () => {
  state.value = await $fetch<State>('/api/social/activitypub/settings').catch(() => null)
})

async function save(body: { enabled: boolean, shop: boolean }) {
  error.value = ''
  saving.value = true
  try {
    state.value = await $fetch<State>('/api/social/activitypub/settings', { method: 'PUT', body })
  } catch (e: any) {
    error.value = e?.data?.statusMessage || e?.data?.message || "That didn't save. Please try again."
  } finally {
    saving.value = false
  }
}
</script>

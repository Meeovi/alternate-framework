<template>
  <div class="federation-connections">
    <p v-if="loading" class="text-caption text-medium-emphasis">Loading…</p>
    <p v-else-if="!networks.length" class="text-caption text-medium-emphasis">No other networks are available.</p>

    <v-card v-for="network in networks" :key="network.id" variant="outlined" class="mb-3">
      <v-card-item>
        <v-card-title class="text-subtitle-1">{{ network.label }}</v-card-title>
        <v-card-subtitle v-if="network.connected && network.account" class="text-wrap">
          Connected as {{ network.account }}
        </v-card-subtitle>
      </v-card-item>
      <v-card-text>
        <p class="text-body-2 mb-2">{{ network.description }}</p>
        <p v-if="network.notice" class="text-caption text-medium-emphasis mb-3">{{ network.notice }}</p>

        <!-- A switch: nothing to fill in (WebTorrent) -->
        <v-switch v-if="network.kind === 'opt-in'" :model-value="network.connected" color="primary" inset hide-details
          :loading="busy === network.id" :disabled="busy === network.id"
          :label="network.connected ? 'On' : 'Off'"
          @update:model-value="$event ? connect(network) : disconnect(network)" />

        <!-- Sign in to their own server (Zot hub, GNU social…) -->
        <template v-else>
          <v-btn v-if="network.connected" variant="tonal" color="error" size="small" :loading="busy === network.id"
            @click="disconnect(network)">Disconnect</v-btn>
          <v-form v-else @submit.prevent="connect(network)">
            <v-text-field v-for="field in network.fields" :key="field.name" v-model="forms[network.id]![field.name]"
              :label="field.label" :type="field.type === 'password' ? 'password' : field.type === 'url' ? 'url' : 'text'"
              :placeholder="field.placeholder" :hint="field.hint" :persistent-hint="!!field.hint"
              :autocomplete="field.type === 'password' ? 'current-password' : 'off'" density="comfortable" class="mb-2" />
            <v-btn type="submit" color="primary" size="small" :loading="busy === network.id">Connect</v-btn>
          </v-form>
        </template>
        <p v-if="errors[network.id]" class="text-caption text-error mt-2">{{ errors[network.id] }}</p>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'

/**
 * Settings → Accounts: networks a member can choose to connect, one card
 * each — whatever federation plugins are installed (Zot, OStatus,
 * WebTorrent…; GET /api/social/federation/connections). Passwords go to
 * the server once, are checked against the member's own server, and are
 * stored encrypted; they're never sent back.
 */
type Field = { name: string, label: string, type: 'text' | 'url' | 'password', placeholder?: string, hint?: string, required: boolean }
type Network = {
  id: string
  label: string
  kind: 'account' | 'opt-in'
  description: string
  notice: string | null
  fields: Field[]
  connected: boolean
  account: string | null
  service: string | null
}

const networks = ref<Network[]>([])
const loading = ref(true)
const busy = ref<string | null>(null)
const errors = reactive<Record<string, string>>({})
const forms = reactive<Record<string, Record<string, string>>>({})

const message = (e: any, fallback: string) => e?.data?.statusMessage || e?.statusMessage || fallback

async function load() {
  try {
    const res = await $fetch<{ networks: Network[] }>('/api/social/federation/connections')
    networks.value = res.networks
    for (const n of res.networks) forms[n.id] ??= Object.fromEntries(n.fields.map((f) => [f.name, '']))
  } catch {
    networks.value = []
  } finally {
    loading.value = false
  }
}

async function connect(network: Network) {
  busy.value = network.id
  errors[network.id] = ''
  try {
    const res = await $fetch<{ account: string | null, service: string | null }>(
      `/api/social/federation/connections/${network.id}`, { method: 'PUT', body: forms[network.id] ?? {} })
    Object.assign(network, { connected: true, account: res.account, service: res.service })
    // Don't keep the password in the page.
    for (const f of network.fields) if (f.type === 'password') forms[network.id]![f.name] = ''
    if (network.id === 'webtorrent') clearNuxtState('meeovi-webtorrent-enabled')
  } catch (e) {
    errors[network.id] = message(e, `Couldn't connect ${network.label}`)
  } finally {
    busy.value = null
  }
}

async function disconnect(network: Network) {
  busy.value = network.id
  errors[network.id] = ''
  try {
    await $fetch(`/api/social/federation/connections/${network.id}`, { method: 'DELETE' })
    Object.assign(network, { connected: false, account: null, service: null })
    if (network.id === 'webtorrent') clearNuxtState('meeovi-webtorrent-enabled')
  } catch (e) {
    errors[network.id] = message(e, `Couldn't disconnect ${network.label}`)
  } finally {
    busy.value = null
  }
}

onMounted(load)
</script>

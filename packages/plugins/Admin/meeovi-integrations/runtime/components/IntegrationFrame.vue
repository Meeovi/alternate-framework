<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import type { IntegrationCapabilities, IntegrationDataResponse, MeeoviIntegrationsPublicConfig } from '../types'
import { integrationSlug, useIntegrations } from '../composables/useIntegrations'

/**
 * Runs an installed integration's sandboxed UI.
 *
 *   <IntegrationFrame plugin="@mframework/list-type-habit-tracker"
 *     :context="{ list }" :capabilities="{ 'list.update': updateItem }" />
 *
 * The iframe is `sandbox="allow-scripts"` (opaque origin: no cookies,
 * storage, or reach into this page), its own CSP blocks every outside host
 * the plugin didn't declare, and it talks to this page only over a private
 * MessageChannel handed over once. It may call:
 *  - data.get / data.set / data.update — the signed-in user's own data for
 *    this plugin (server-checked: installed, own install only)
 *  - ui.resize / ui.notify
 *  - the `capabilities` this page lends it, nothing else
 * If the frame navigates away from its sandbox page, it is shut down.
 */
const props = withDefaults(defineProps<{
  plugin: string
  /** Read-only data for the integration (JSON-cloned). */
  context?: Record<string, unknown>
  /** Host functions it may call, by name. */
  capabilities?: IntegrationCapabilities
  title?: string
  minHeight?: number
}>(), { context: () => ({}), capabilities: () => ({}), title: '', minHeight: 120 })

const emit = defineEmits<{ (e: 'notify', text: string): void }>()

const config = useRuntimeConfig().public.meeoviIntegrations as MeeoviIntegrationsPublicConfig | undefined
const apiBase = config?.apiBase || '/api/integrations'
const slug = computed(() => integrationSlug(props.plugin))
const src = computed(() => `${(config?.sandboxBase || '/integration-sandbox').replace(/\/+$/, '')}/${slug.value}/`)

const { isInstalled } = useIntegrations()
const installed = computed(() => isInstalled(props.plugin))

const frame = ref<HTMLIFrameElement | null>(null)
const height = ref(props.minHeight)
const stopped = ref(false)
const toast = ref('')
const channel = shallowRef<MessagePort | null>(null)
let loads = 0
let inFlight = 0

// Client-only: a server-rendered iframe would finish loading before this
// component hydrates and miss its load event — and with it the handshake.
const mounted = ref(false)
onMounted(() => { mounted.value = true })

const MAX_IN_FLIGHT = 20
const MAX_HEIGHT = 4000
const clone = <T>(value: T): T => (value === undefined ? value : JSON.parse(JSON.stringify(value)))

function close() {
  channel.value?.close()
  channel.value = null
}

function onLoad() {
  loads += 1
  // A second load means the page inside navigated (or was navigated) away
  // from its sandbox entry: don't trust what's there, don't talk to it.
  if (loads > 1) {
    close()
    stopped.value = true
    return
  }
  const win = frame.value?.contentWindow
  if (!win) return
  const { port1, port2 } = new MessageChannel()
  port1.onmessage = (event) => handle(port1, event.data)
  channel.value = port1
  // The frame's origin is opaque ("null"), so '*' is the only target; the
  // port transferred here is what every later message travels on.
  win.postMessage({ type: 'meeovi:init', context: clone(props.context) }, '*', [port2])
}

const dataUrl = () => `${apiBase}/${encodeURIComponent(slug.value)}/data`

async function run(method: string, params: unknown): Promise<unknown> {
  switch (method) {
    case 'data.get':
      return (await $fetch<IntegrationDataResponse>(dataUrl())).data
    case 'data.set':
    case 'data.update':
      if (!params || typeof params !== 'object' || Array.isArray(params)) throw new Error('Send an object')
      return (await $fetch<IntegrationDataResponse>(dataUrl(), { method: method === 'data.set' ? 'PUT' : 'PATCH', body: params })).data
    case 'ui.resize': {
      const h = Number(params)
      if (Number.isFinite(h)) height.value = Math.min(MAX_HEIGHT, Math.max(props.minHeight, Math.ceil(h)))
      return null
    }
    case 'ui.notify': {
      const text = String(params ?? '').slice(0, 200)
      toast.value = text
      emit('notify', text)
      return null
    }
    default: {
      const handler = Object.hasOwn(props.capabilities, method) ? props.capabilities[method] : undefined
      if (typeof handler !== 'function') throw new Error(`Not allowed: ${method}`)
      return handler(clone(params))
    }
  }
}

async function handle(port: MessagePort, message: unknown) {
  const { id, method, params } = (message ?? {}) as { id?: unknown, method?: unknown, params?: unknown }
  if (typeof id !== 'number' || typeof method !== 'string') return
  if (inFlight >= MAX_IN_FLIGHT) return port.postMessage({ id, error: 'Too many requests' })
  inFlight += 1
  try {
    port.postMessage({ id, result: clone(await run(method, params)) ?? null })
  } catch (error: any) {
    const status = error?.statusCode ?? error?.status
    port.postMessage({ id, error: status === 403 ? 'Not installed' : status === 401 ? 'Signed out' : String(error?.message || 'Failed') })
  } finally {
    inFlight -= 1
  }
}

// A different plugin is a different sandbox: start over.
watch(() => props.plugin, () => {
  close()
  loads = 0
  stopped.value = false
  height.value = props.minHeight
})

onBeforeUnmount(close)
</script>

<template>
  <div class="integration-frame">
    <v-alert v-if="stopped" type="warning" variant="tonal" density="comfortable" icon="fas fa-shield-halved">
      This integration tried to leave its sandbox and was stopped.
    </v-alert>
    <iframe
      v-else-if="installed && mounted"
      ref="frame"
      :key="plugin"
      :src="src"
      :title="title || `${slug} integration`"
      :style="{ height: `${height}px` }"
      class="integration-frame__iframe"
      sandbox="allow-scripts"
      allow=""
      referrerpolicy="no-referrer"
      credentialless
      loading="lazy"
      @load="onLoad"
    />
    <v-snackbar :model-value="!!toast" timeout="3000" @update:model-value="toast = ''">{{ toast }}</v-snackbar>
  </div>
</template>

<style scoped>
.integration-frame__iframe {
  display: block;
  width: 100%;
  border: 0;
  background: transparent;
}
</style>

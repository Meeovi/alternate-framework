<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import type { Editor } from 'grapesjs'
import { useRoute, useNuxtApp } from 'nuxt/app'
import { useSpacesBuilder } from '../composables/useExperienceBuilder'
import { getAllComponents } from '../registry'
import { sanitizeGrapesJson } from '../utils/sanitize'
import { getComponentsForEntity } from '../registry/helpers/resolveDomains'

const props = defineProps<{
  spaceId: string
  slug: string
  initialTitle?: string
  entityType: string
}>()

const { $grapesjs } = useNuxtApp() as any
const { setEditor, loadPage, savePage } = useSpacesBuilder()

const editor = ref<Editor | null>(null)
const loading = ref(true)
const saving = ref(false)
const title = ref(props.initialTitle || '')
const components = getComponentsForEntity(props.entityType)

async function initEditor () {
  const container = document.getElementById('spaces-builder-canvas')
  if (!container) return

  const e = $grapesjs.init({
    container,
    height: '100vh',
    fromElement: false,
    storageManager: { type: null },
    selectorManager: { componentFirst: true },
    canvas: {
      styles: [],
      scripts: []
    }
  })

  // Register components
  const registry = getAllComponents()
  registry.forEach(def => {
    e.Components.addType(def.grapes.type, {
      model: {
        defaults: {
          ...def.defaultProps,
          traits: def.grapes.traits || []
        }
      }
    })
  })

  setEditor(e)
  editor.value = e

  // Load existing page
  try {
    const page = await loadPage(props.spaceId, props.slug)
    if (page?.data) {
      const safe = sanitizeGrapesJson(page.data)
      e.loadProjectData(safe)
      title.value = page.title
    }
  } catch {
    // new page, ignore
  } finally {
    loading.value = false
  }
}

async function handleSave () {
  if (!editor.value) return
  saving.value = true
  try {
    const project = editor.value.getProjectData()
    const payload = {
      spaceId: props.spaceId,
      slug: props.slug,
      title: title.value || props.slug,
      data: sanitizeGrapesJson(project),
      published: true
    }
    await savePage(payload)
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  initEditor()
})
</script>

<template>
  <div class="spaces-builder">
    <header class="spaces-builder__header">
      <input
        v-model="title"
        type="text"
        class="spaces-builder__title"
        placeholder="Page title"
      />
      <button
        class="spaces-builder__save"
        :disabled="saving || loading"
        @click="handleSave"
      >
        {{ saving ? 'Saving…' : 'Save' }}
      </button>
    </header>

    <div v-if="loading" class="spaces-builder__loading">
      Loading builder…
    </div>

    <div
      v-else
      id="spaces-builder-canvas"
      class="spaces-builder__canvas"
    />
  </div>
</template>

<style scoped>
.spaces-builder {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.spaces-builder__header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
  background: var(--header-bg, #ffffff);
}
.spaces-builder__title {
  flex: 1;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 0.4rem 0.6rem;
}
.spaces-builder__save {
  padding: 0.4rem 0.9rem;
  border-radius: 0.375rem;
  border: none;
  background: #111827;
  color: #fff;
  cursor: pointer;
}
.spaces-builder__canvas {
  flex: 1;
}
.spaces-builder__loading {
  padding: 1rem;
}
</style>

<template>
  <div class="contentPage">
    <v-toolbar color="primary">
      <v-toolbar-title>My products</v-toolbar-title>
      <v-spacer />
      <!-- A video from YouTube, Vimeo… as a free product (@mframework/meeovi-video-bookmarks, when installed) -->
      <component :is="addVideoLink" v-if="typeof addVideoLink !== 'string'" variant="flat" color="white" class="mr-2"
        label="Add video link" @added="refresh()" />
      <v-btn prepend-icon="fas fa-plus" variant="flat" color="white" class="mr-2" @click="openForm">Add product</v-btn>
    </v-toolbar>

    <!-- The seller's products in the store (Mage-OS), through the business driver. -->
    <div style="padding: 10px">
      <v-alert v-if="error" type="error" variant="tonal" class="mb-4">We couldn't load your products. Please try again.</v-alert>
      <v-data-table :headers="headers" :items="rows || []" :loading="pending" item-value="sku" density="comfortable">
        <template #item.price="{ value }">{{ Number(value) > 0 ? money(value) : 'Free' }}</template>
        <template #item.status="{ value }">
          <v-chip size="small" :color="statusColor(value)">{{ statusLabel(value) }}</v-chip>
        </template>
        <template #no-data>You haven't added any products yet.</template>
      </v-data-table>
    </div>

    <v-dialog v-model="formOpen" max-width="640">
      <v-card>
        <v-card-title>Add product</v-card-title>
        <v-card-text>
          <v-form ref="formRef" @submit.prevent="submit">
            <v-text-field v-model="form.name" label="Name" :rules="[required]" maxlength="255" />
            <v-text-field v-model="form.price" label="Price (USD)" type="number" min="0" step="0.01" :rules="[nonNegative]" hint="0 makes it free" persistent-hint />
            <v-textarea v-model="form.description" label="Description" rows="4" auto-grow maxlength="20000" class="mt-2" />
            <v-row dense>
              <v-col cols="12" sm="6">
                <v-select v-model="form.departmentId" :items="departments" item-title="name" item-value="id" label="Department"
                  :rules="[required]" :loading="departmentsPending" />
              </v-col>
              <v-col cols="12" sm="6">
                <v-select v-model="form.categoryId" :items="categories" item-title="label" item-value="id" label="Category"
                  :rules="[required]" :disabled="!form.departmentId" no-data-text="Choose a department first" />
              </v-col>
            </v-row>
            <!-- Filled in from the department and category; the seller can remove any and add their own, 5 in all. -->
            <v-combobox v-model="form.tags" label="Tags" multiple chips closable-chips
              :hint="`Up to ${MAX_TAGS}. Press Enter after each one.`" persistent-hint
              :rules="[maxTags]" :delimiters="[',']" />
            <!-- A sticker, filter or background members buy and use in the vibe editor -->
            <v-select v-model="form.effectKind" :items="EFFECT_KINDS" label="Vibe effect (optional)" clearable class="mt-2"
              hint="Sell a sticker, filter or background people use in their vibez" persistent-hint />
            <template v-if="form.effectKind === 'sticker' || form.effectKind === 'background'">
              <v-file-input v-model="form.effect" class="mt-2" show-size prepend-icon="fas fa-wand-magic-sparkles"
                :label="form.effectKind === 'sticker' ? 'Sticker image (PNG, WebP or GIF, up to 2 MB)' : 'Background image (JPEG, PNG or WebP, up to 5 MB)'"
                :accept="form.effectKind === 'sticker' ? 'image/png,image/webp,image/gif' : 'image/jpeg,image/png,image/webp'"
                :rules="[requiredFile]" />
            </template>
            <div v-else-if="form.effectKind === 'filter'" class="mt-2">
              <p class="text-body-2 mb-1">Filter settings</p>
              <div class="d-flex align-center ga-3 mb-2">
                <div class="seller-filter-preview" :style="{ filter: filterPreview }" />
                <span class="text-caption text-medium-emphasis">Preview</span>
              </div>
              <v-slider v-for="s in FILTER_SLIDERS" :key="s.key" v-model="form.filter[s.key]" :label="s.label" :min="s.min"
                :max="s.max" :step="s.step" hide-details density="compact" />
            </div>
            <v-file-input v-model="form.image" label="Image (JPEG, PNG or GIF, up to 8 MB)" accept="image/jpeg,image/png,image/gif" prepend-icon="fas fa-image" show-size />
            <v-file-input v-model="form.download" label="Download file (optional, up to 200 MB)" prepend-icon="fas fa-file-arrow-down" show-size
              hint="What buyers get: an image, PDF, ZIP, audio or video file" persistent-hint />
            <v-text-field v-if="!form.download && !form.effectKind" v-model="form.qty" label="Quantity in stock" type="number" min="0" step="1" class="mt-2" />
            <v-checkbox v-model="form.allowFreeDownload" :disabled="!canBeFree" class="mt-2" hide-details
              label="Allow anyone to download it for free" />
            <p v-if="!canBeFree" class="text-caption text-medium-emphasis">Needs a price of 0 and a download file.</p>
            <v-alert v-if="formError" type="error" variant="tonal" class="mt-4">{{ formError }}</v-alert>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" :disabled="saving" @click="formOpen = false">Cancel</v-btn>
          <v-btn color="primary" variant="flat" :loading="saving" @click="submit">Add product</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, resolveComponent, watch } from 'vue'
import { useBusinessDriver } from '../../../composables/useBusinessDriver'

definePageMeta({ middleware: 'seller' })
useHead({ title: 'My products' })

const addVideoLink = resolveComponent('AddVideoLink')
const snackbar = useSnackbar()
const business = useBusinessDriver()
const { data: rows, pending, error, refresh } = useAsyncData('workspace-my-products', () => business.products.list(), { default: () => [] })

const headers = [
  { title: 'Product', key: 'name' },
  { title: 'SKU', key: 'sku' },
  { title: 'Price', key: 'price', align: 'end' as const },
  { title: 'Stock', key: 'stock', align: 'end' as const },
  { title: 'Status', key: 'status' },
]
const statusLabel = (status: string) => ({ active: 'Live', draft: 'Waiting for approval', archived: 'Disabled' } as Record<string, string>)[status] || status
const statusColor = (status: string) => ({ active: 'success', draft: 'warning' } as Record<string, string>)[status] || 'default'
const money = (value: unknown) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0)

const blank = () => ({
  name: '', price: '0', description: '', qty: '0', image: null as File | null, download: null as File | null, allowFreeDownload: false,
  departmentId: null as number | null, categoryId: null as number | null, tags: [] as string[],
  effectKind: null as 'sticker' | 'filter' | 'background' | null, effect: null as File | null,
  filter: { brightness: 1, contrast: 1, saturate: 1, warmth: 0, hue: 0, vignette: 0 } as Record<string, number>,
})
const form = reactive(blank())
const formOpen = ref(false)
const formRef = ref()
const saving = ref(false)
const formError = ref('')

// Departments and their categories, as the store front shows them.
const { $directus, $readItems } = useNuxtApp()
const { data: departmentRows, pending: departmentsPending } = useAsyncData('workspace-product-departments', () => $directus.request($readItems('departments', {
  filter: { type: { _eq: 'department' }, active: { _eq: 'active' } },
  fields: ['id', 'name', { categories: [{ categories_id: ['id', 'name', { parent: ['name'] }] }] }],
  sort: ['name'],
  limit: -1,
})).catch(() => []), { default: () => [] })
type DepartmentCategory = { id: number, name: string, parent?: { name?: string } | null }
const departments = computed(() => (departmentRows.value || []) as { id: number, name: string, categories?: { categories_id?: DepartmentCategory | null }[] }[])
// A subcategory is labelled with the category it sits under
// ("Photography › Travel"); its own name is what becomes a tag.
const categories = computed(() => {
  const department = departments.value.find((d) => d.id === form.departmentId)
  const seen = new Set<number>()
  return (department?.categories || [])
    .map((c) => c.categories_id)
    .filter((c): c is DepartmentCategory => !!c?.name && !seen.has(c.id) && !!seen.add(c.id))
    .map((c) => ({ ...c, label: c.parent?.name ? `${c.parent.name} › ${c.name}` : c.name }))
    .sort((a, b) => a.label.localeCompare(b.label))
})
watch(() => form.departmentId, () => { form.categoryId = null })

const MAX_TAGS = 5
// The department's and category's names, suggested as tags: when they
// change, the old suggestions the seller kept are swapped for the new ones
// (while there's room), and tags the seller typed are left alone.
const suggestedTags = computed(() => {
  const department = departments.value.find((d) => d.id === form.departmentId)?.name
  const category = categories.value.find((c) => c.id === form.categoryId)?.name
  return [...new Set([department, category].filter(Boolean) as string[])]
})
let lastSuggested: string[] = []
watch(suggestedTags, (next) => {
  const kept = form.tags.filter((tag) => !lastSuggested.includes(tag))
  const added = next.filter((tag) => !kept.some((t) => t.toLowerCase() === tag.toLowerCase()))
  form.tags = [...added, ...kept].slice(0, MAX_TAGS)
  lastSuggested = next
})
const maxTags = (tags: string[]) => (tags?.length ?? 0) <= MAX_TAGS || `Up to ${MAX_TAGS} tags`

const canBeFree = computed(() => Number(form.price) === 0 && !!form.download)
watch(canBeFree, (ok) => { if (!ok) form.allowFreeDownload = false })

const required = (v: unknown) => !!String(v ?? '').trim() || 'Required'
const requiredFile = (v: File | File[] | null) => !!single(v) || 'Required'

// Vibe effects (layers/social server/utils/vibeEffects.ts).
const EFFECT_KINDS = [
  { title: 'Sticker', value: 'sticker' },
  { title: 'Filter', value: 'filter' },
  { title: 'Background', value: 'background' },
]
const FILTER_SLIDERS = [
  { key: 'brightness', label: 'Brightness', min: 0.5, max: 1.5, step: 0.01 },
  { key: 'contrast', label: 'Contrast', min: 0.5, max: 1.5, step: 0.01 },
  { key: 'saturate', label: 'Colour', min: 0, max: 2, step: 0.01 },
  { key: 'warmth', label: 'Warmth', min: 0, max: 0.6, step: 0.01 },
  { key: 'hue', label: 'Hue', min: -180, max: 180, step: 1 },
  { key: 'vignette', label: 'Vignette', min: 0, max: 0.8, step: 0.01 },
]
/** Only the settings moved away from neutral. */
const filterSettings = computed(() => Object.fromEntries(Object.entries(form.filter)
  .filter(([key, value]) => value !== (['brightness', 'contrast', 'saturate'].includes(key) ? 1 : 0))))
const filterPreview = computed(() => {
  const f = form.filter
  return `brightness(${f.brightness}) contrast(${f.contrast}) saturate(${f.saturate}) sepia(${f.warmth}) hue-rotate(${f.hue}deg)`
})
const nonNegative = (v: string) => (Number(v) >= 0 && Number.isFinite(Number(v))) || 'Must be 0 or more'

function openForm() {
  Object.assign(form, blank())
  lastSuggested = []
  formError.value = ''
  formOpen.value = true
}

// An empty department or category page links here with ?add=1 and its
// department (and category): the form opens with them already chosen, as
// long as they're ones a product can go in.
const route = useRoute()
onMounted(async () => {
  if (route.query.add !== '1') return
  openForm()
  const wanted = (key: string) => Number(Array.isArray(route.query[key]) ? route.query[key][0] : route.query[key]) || null
  const departmentId = wanted('department')
  const categoryId = wanted('category')
  if (!departmentId) return
  // The departments may still be loading on a client-side visit.
  if (departmentsPending.value) await new Promise<void>((resolve) => { const stop = watch(departmentsPending, (p) => { if (!p) { stop(); resolve() } }) })
  if (!departments.value.some((d) => d.id === departmentId)) return
  form.departmentId = departmentId
  await nextTick() // choosing a department clears the category
  if (categoryId && categories.value.some((c) => c.id === categoryId)) form.categoryId = categoryId
})

// v-file-input gives a File or (multiple) an array, depending on version.
const single = (value: File | File[] | null) => (Array.isArray(value) ? value[0] : value) || null

async function submit() {
  const { valid } = await formRef.value?.validate() ?? { valid: true }
  if (!valid) return
  saving.value = true
  formError.value = ''
  try {
    const body = new FormData()
    body.append('name', form.name.trim())
    body.append('price', String(Number(form.price) || 0))
    body.append('description', form.description)
    body.append('qty', String(Math.max(0, Math.trunc(Number(form.qty) || 0))))
    body.append('allowFreeDownload', String(form.allowFreeDownload && canBeFree.value))
    body.append('departmentId', String(form.departmentId ?? ''))
    body.append('categoryId', String(form.categoryId ?? ''))
    body.append('tags', JSON.stringify(form.tags.map((t) => String(t).trim()).filter(Boolean)))
    const image = single(form.image)
    const download = single(form.download)
    if (image) body.append('image', image, image.name)
    if (download) body.append('download', download, download.name)
    if (form.effectKind) {
      body.append('effectKind', form.effectKind)
      const effect = single(form.effect)
      if (effect) body.append('effect', effect, effect.name)
      if (form.effectKind === 'filter') {
        if (!Object.keys(filterSettings.value).length) { formError.value = 'Move at least one filter setting.'; return }
        body.append('effectConfig', JSON.stringify(filterSettings.value))
      }
    }
    const result = await $fetch<{ sku: string, problems: string[] }>('/api/business/products', { method: 'POST', body })
    formOpen.value = false
    snackbar.show({
      message: result.problems?.length
        ? `Product added, but its ${result.problems.join(' and ')} didn't upload. Edit it in the store or try again.`
        : form.effectKind
          ? 'Product added. Once the store approves it, it shows in the vibe editor\'s shop.'
          : 'Product added. It goes live once the store approves it.',
      color: result.problems?.length ? 'warning' : 'success',
    })
    await refresh()
  } catch (err: any) {
    formError.value = err?.data?.statusMessage || err?.statusMessage || 'The product couldn\'t be added. Please try again.'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.seller-filter-preview {
  width: 72px;
  height: 48px;
  border-radius: 8px;
  background: linear-gradient(135deg, #f6b26b, #6fa8dc 50%, #93c47d);
}
</style>

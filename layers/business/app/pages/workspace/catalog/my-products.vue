<template>
  <div class="contentPage">
    <v-toolbar color="primary">
      <v-toolbar-title>My products</v-toolbar-title>
      <v-spacer />
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
                <v-select v-model="form.categoryId" :items="categories" item-title="name" item-value="id" label="Category"
                  :rules="[required]" :disabled="!form.departmentId" no-data-text="Choose a department first" />
              </v-col>
            </v-row>
            <!-- The department's and category's tags are added for the seller; they add up to 5 more. -->
            <div v-if="autoTags.length" class="mb-1">
              <span class="text-caption text-medium-emphasis mr-1">Tags:</span>
              <v-chip v-for="tag in autoTags" :key="tag" size="small" class="ma-1" prepend-icon="fas fa-hashtag">{{ tag }}</v-chip>
            </div>
            <v-combobox v-model="form.tags" label="More tags (optional)" multiple chips closable-chips
              :hint="`Up to ${MAX_EXTRA_TAGS} more. Press Enter after each one.`" persistent-hint
              :rules="[maxTags]" :delimiters="[',']" />
            <v-file-input v-model="form.image" label="Image (JPEG, PNG or GIF, up to 8 MB)" accept="image/jpeg,image/png,image/gif" prepend-icon="fas fa-image" show-size />
            <v-file-input v-model="form.download" label="Download file (optional, up to 200 MB)" prepend-icon="fas fa-file-arrow-down" show-size
              hint="What buyers get: an image, PDF, ZIP, audio or video file" persistent-hint />
            <v-text-field v-if="!form.download" v-model="form.qty" label="Quantity in stock" type="number" min="0" step="1" class="mt-2" />
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
import { computed, reactive, ref, watch } from 'vue'
import { useBusinessDriver } from '../../../composables/useBusinessDriver'

definePageMeta({ middleware: 'seller' })
useHead({ title: 'My products' })

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
})
const form = reactive(blank())
const formOpen = ref(false)
const formRef = ref()
const saving = ref(false)
const formError = ref('')

// Departments and their categories, as the store front shows them.
const { $directus, $readItems } = useNuxtApp()
const { data: departmentRows, pending: departmentsPending } = useAsyncData('workspace-product-departments', () => $directus.request($readItems('departments', {
  filter: { type: { _eq: 'department' } },
  fields: ['id', 'name', { categories: [{ categories_id: ['id', 'name'] }] }],
  sort: ['name'],
  limit: -1,
})).catch(() => []), { default: () => [] })
const departments = computed(() => (departmentRows.value || []) as { id: number, name: string, categories?: { categories_id?: { id: number, name: string } | null }[] }[])
const categories = computed(() => {
  const department = departments.value.find((d) => d.id === form.departmentId)
  const seen = new Set<number>()
  return (department?.categories || [])
    .map((c) => c.categories_id)
    .filter((c): c is { id: number, name: string } => !!c?.name && !seen.has(c.id) && !!seen.add(c.id))
    .sort((a, b) => a.name.localeCompare(b.name))
})
watch(() => form.departmentId, () => { form.categoryId = null })

const MAX_EXTRA_TAGS = 5
const autoTags = computed(() => {
  const department = departments.value.find((d) => d.id === form.departmentId)?.name
  const category = categories.value.find((c) => c.id === form.categoryId)?.name
  return [...new Set([department, category].filter(Boolean) as string[])]
})
const maxTags = (tags: string[]) => (tags?.length ?? 0) <= MAX_EXTRA_TAGS || `Up to ${MAX_EXTRA_TAGS} more tags`

const canBeFree = computed(() => Number(form.price) === 0 && !!form.download)
watch(canBeFree, (ok) => { if (!ok) form.allowFreeDownload = false })

const required = (v: unknown) => !!String(v ?? '').trim() || 'Required'
const nonNegative = (v: string) => (Number(v) >= 0 && Number.isFinite(Number(v))) || 'Must be 0 or more'

function openForm() {
  Object.assign(form, blank())
  formError.value = ''
  formOpen.value = true
}

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
    const result = await $fetch<{ sku: string, problems: string[] }>('/api/business/products', { method: 'POST', body })
    formOpen.value = false
    snackbar.show({
      message: result.problems?.length
        ? `Product added, but its ${result.problems.join(' and ')} didn't upload. Edit it in the store or try again.`
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

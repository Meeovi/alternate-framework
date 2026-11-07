<template>
  <div class="effect-picker">
    <v-chip-group v-model="tab" mandatory selected-class="text-primary" class="mb-2">
      <v-chip value="builtin" size="small">Meeovi</v-chip>
      <v-chip value="mine" size="small">Mine</v-chip>
      <v-chip value="owned" size="small">Owned</v-chip>
      <v-chip value="community" size="small">Community</v-chip>
      <v-chip value="shop" size="small">Shop</v-chip>
    </v-chip-group>

    <v-progress-linear v-if="loading" indeterminate class="mb-2" />
    <p v-else-if="!shown.length" class="text-body-2 text-medium-emphasis">{{ emptyText }}</p>

    <div class="effect-picker__grid">
      <div v-for="effect in shown" :key="effect.id" class="effect-picker__cell">
        <button type="button" class="effect-picker__item" :class="{ 'effect-picker__item--locked': effect.usable === false }"
          :aria-label="effect.usable === false ? `${effect.name}: get it in the shop` : `Use ${effect.name}`"
          :title="effect.name" @click="choose(effect)">
          <img v-if="effect.asset_url" :src="effect.asset_url" :alt="effect.name" loading="lazy">
          <span v-else-if="effect.emoji" class="effect-picker__emoji">{{ effect.emoji }}</span>
          <span v-else class="effect-picker__swatch" :style="{ filter: swatchFilter(effect) }" />
          <span class="effect-picker__name">{{ effect.name }}</span>
          <span v-if="effect.product" class="effect-picker__price">{{ priceLabel(effect.product.price) }}</span>
        </button>
        <div v-if="tab === 'mine' || tab === 'community'" class="effect-picker__more">
          <v-btn v-if="effect.mine" icon="fas fa-trash" size="x-small" variant="text" :aria-label="`Delete ${effect.name}`"
            @click="remove(effect)" />
          <ReportToModerators v-else-if="tab === 'community'" network="meeovi" label=""
            :subject="{ kind: 'effect', id: String(effect.id) }" />
        </div>
      </div>
    </div>
    <p v-if="error" class="text-caption text-error mt-1">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import ReportToModerators from '../../../blocks/ReportToModerators.vue'
import { BUILTIN_FILTERS, BUILTIN_STICKERS, canvasFilter, emojiImage } from '../../../../utils/vibeEditor/filters'
import type { VibeEffect } from '../../../../utils/vibeEditor/types'

/**
 * Picks a sticker, filter or background for the vibe editor: Meeovi's
 * built-in ones, the member's own, owned (bought or free) products, shared
 * community ones, and the shop (effects sold as products → product page).
 */
type Item = Omit<VibeEffect, 'product'> & {
  usable?: boolean
  emoji?: string
  product?: { id: number | string, name?: string, price?: string | number | null, key?: string } | null
}

const props = defineProps<{ kind: 'sticker' | 'filter' | 'background', reload?: number }>()
const emit = defineEmits<{ pick: [effect: Item] }>()

const tab = ref<'builtin' | 'mine' | 'owned' | 'community' | 'shop'>('builtin')
const items = ref<Item[]>([])
const loading = ref(false)
const error = ref('')

const builtins = computed<Item[]>(() => {
  if (props.kind === 'filter') return BUILTIN_FILTERS.map((f) => ({ id: f.id, kind: 'filter' as const, name: f.name, asset_url: null, config: f.config, builtin: true }))
  if (props.kind === 'sticker') return BUILTIN_STICKERS.map((emoji) => ({ id: `emoji:${emoji}`, kind: 'sticker' as const, name: emoji, asset_url: null, config: null, builtin: true, emoji }))
  return [{ id: 'builtin:blur', kind: 'background' as const, name: 'Blur', asset_url: null, config: null, builtin: true }]
})

const shown = computed(() => (tab.value === 'builtin' ? builtins.value : items.value))
const emptyText = computed(() => ({
  builtin: '',
  mine: `You haven't made a ${props.kind} yet. Use "Make your own" below.`,
  owned: `No ${props.kind}s from the shop yet. Free ones and ones you buy show here.`,
  community: `No shared ${props.kind}s yet.`,
  shop: `No ${props.kind}s for sale yet.`,
}[tab.value]))

async function load() {
  if (tab.value === 'builtin') return
  loading.value = true
  error.value = ''
  try {
    const res = await $fetch<{ items: Item[] }>('/api/social/vibez/effects', { query: { tab: tab.value, kind: props.kind } })
    items.value = res.items
  } catch (e: any) {
    items.value = []
    error.value = e?.data?.statusMessage || "Effects couldn't be loaded."
  } finally {
    loading.value = false
  }
}
watch([tab, () => props.kind, () => props.reload], load)

function choose(effect: Item) {
  if (effect.usable === false && effect.product) {
    window.open(`/product/${encodeURIComponent(effect.product.key || String(effect.product.id))}`, '_blank', 'noopener')
    return
  }
  emit('pick', effect.emoji ? { ...effect, asset_url: emojiImage(effect.emoji) } : effect)
}

async function remove(effect: Item) {
  if (!window.confirm(`Delete "${effect.name}"?`)) return
  try {
    await $fetch(`/api/social/vibez/effects/${effect.id}`, { method: 'DELETE' })
    items.value = items.value.filter((item) => item.id !== effect.id)
  } catch (e: any) {
    error.value = e?.data?.statusMessage || "That didn't delete."
  }
}

const swatchFilter = (effect: Item) => (effect.config ? canvasFilter(effect.config) : 'none')
const priceLabel = (price: unknown) => (Number(price) > 0 ? `$${Number(price).toFixed(2)}` : 'Free')
</script>

<style scoped>
.effect-picker__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(84px, 1fr));
  gap: 8px;
}

.effect-picker__cell {
  position: relative;
}

.effect-picker__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 100%;
  padding: 6px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 10px;
  background: none;
  color: inherit;
  cursor: pointer;
}

.effect-picker__item:hover,
.effect-picker__item:focus-visible {
  border-color: rgb(var(--v-theme-primary));
}

.effect-picker__item--locked {
  opacity: 0.75;
}

.effect-picker__item img,
.effect-picker__swatch {
  width: 56px;
  height: 56px;
  object-fit: contain;
  border-radius: 8px;
}

.effect-picker__swatch {
  display: block;
  background: linear-gradient(135deg, #f6b26b, #6fa8dc 50%, #93c47d);
}

.effect-picker__emoji {
  font-size: 40px;
  line-height: 56px;
}

.effect-picker__name {
  max-width: 100%;
  overflow: hidden;
  font-size: 0.75rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.effect-picker__price {
  font-size: 0.7rem;
  font-weight: 700;
}

.effect-picker__more {
  position: absolute;
  top: 0;
  right: 0;
}
</style>

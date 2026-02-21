<template>
	<div class="autocomplete">
		<UInput
			v-model="input"
			@input="onInput"
			@keydown.enter.prevent="onSelectFirst"
			:placeholder="placeholder"
			class="autocomplete-input"
		/>
		<ul v-if="suggestions.length" class="autocomplete-list">
			<li v-for="(s, i) in suggestions" :key="i" @click="select(s)">
				<div class="title">{{ s.title || s.name || s.label || s.id }}</div>
				<div class="subtitle" v-if="s.description">{{ s.description }}</div>
			</li>
		</ul>
	</div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import useStorefront from '../../composables/useStorefront'
import { useRouter } from 'vue-router'

const router = useRouter()
const storefront = useStorefront()

const props = defineProps({ placeholder: { type: String, default: 'Search...' } })
const emits = defineEmits(['select', 'input'])

const { autocomplete } = useStorefront()
const input = ref('')
const suggestions = ref<any[]>([])
let timer: any = null

async function onInput() {
	emits('input', input.value)
	clearTimeout(timer)
	timer = setTimeout(async () => {
		if (!input.value || input.value.length < 1) {
			suggestions.value = []
			return
		}
			suggestions.value = await autocomplete(input.value, 6)
	}, 180)
}

async function select(item: any) {
	emits('select', item)
	suggestions.value = []
	const val = typeof item === 'string' ? item : item.title || item.name || item.label || item.id || ''
	if (!val) return
	try {
		storefront.query.value = val
		await storefront.search()
	} catch (e) {
		// ignore
	}
	router.push({ path: '/results', query: { q: val } })
}

function onSelectFirst() {
    if (suggestions.value.length) select(suggestions.value[0])
}

watch(input, (v) => {
	if (!v) suggestions.value = []
})
</script>

<style scoped>
.autocomplete { position: relative; }
.autocomplete-list { position: absolute; left: 0; right: 0; background: white; z-index: 50; list-style: none; margin: 0; padding: 0; border: 1px solid #ddd; }
.autocomplete-list li { padding: 8px; cursor: pointer; }
.autocomplete-list li:hover { background: #f5f5f5; }
.autocomplete-input { width: 100%; padding: 8px; border: 1px solid #ccc; }
</style>

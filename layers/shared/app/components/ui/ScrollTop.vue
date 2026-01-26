<script setup lang="ts">
import { ref, computed } from 'vue';
import { useWindowScroll } from '@vueuse/core';

const el = ref<HTMLElement | null>(null);
const { y } = useWindowScroll();

const radius = 25;
const stroke = 5;
const circumference = 2 * Math.PI * radius;
const dashArray = `${circumference} ${circumference}`;
const progress = computed(() => {
	if (el.value) {
		const sc = el.value.scrollTop;
		const total = el.value.scrollHeight - (el.value.clientHeight || 0);
		return total <= 0 ? 0 : Math.min(sc / total, 1);
	}
	const sc = y.value;
	const doc = document.documentElement;
	const total = (doc.scrollHeight || 0) - (window.innerHeight || 0);
	return total <= 0 ? 0 : Math.min(sc / total, 1);
});

const dashOffset = computed(() => circumference * (1 - (progress.value ?? 0)));

function scrollToTop() {
	if (el.value) el.value.scrollTo({ top: 0, behavior: 'smooth' });
	else window.scrollTo({ top: 0, behavior: 'smooth' });
}
</script>

<template>
	<div class="flex items-center" ref="el">
		<div class="relative">
			<svg :width="(radius + stroke) * 2" :height="(radius + stroke) * 2" viewBox="0 0 60 60" class="text-primary/75">
				<g transform="translate(30,30)">
					<circle
						r="25"
						fill="transparent"
						stroke="currentColor"
						:stroke-width="stroke"
						class="text-gray-200"
					/>
					<circle
						r="25"
						fill="transparent"
						stroke="currentColor"
						:stroke-width="stroke"
						stroke-linecap="round"
						:stroke-dasharray="dashArray"
						:stroke-dashoffset="dashOffset"
						transform="rotate(-90)"
						class="text-primary/75"
					/>
				</g>
			</svg>

			<button
				v-if="progress >= 0.95"
				class="absolute inset-0 flex items-center justify-center"
				@click="scrollToTop"
				aria-label="Scroll to top"
			>
				<svg class="w-4 h-4 text-primary/75 hover:text-gray-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
					<path d="M12 4v16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
					<path d="M18 10l-6-6-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</button>
		</div>

		<span
			v-if="progress >= 0.95"
			class="p-1.5 text-gray-700 bg-gray-300 bg-opacity-50 rounded-xl dark:bg-gray-700 dark:text-gray-200 font-display"
		>
			fin.
		</span>
	</div>
</template>

<style scoped>
.text-primary\/75 { color: theme('colors.primary', '#0ea5a0'); }
</style>

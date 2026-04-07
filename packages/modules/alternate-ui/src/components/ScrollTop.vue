<template>
  <div class="aui-scroll-top">
    <svg :width="(radius + stroke) * 2" :height="(radius + stroke) * 2" viewBox="0 0 60 60" class="aui-scroll-top__ring">
      <g transform="translate(30,30)">
        <circle r="25" fill="transparent" stroke="currentColor" :stroke-width="stroke" class="aui-scroll-top__track" />
        <circle
          r="25"
          fill="transparent"
          stroke="currentColor"
          :stroke-width="stroke"
          stroke-linecap="round"
          :stroke-dasharray="dashArray"
          :stroke-dashoffset="dashOffset"
          transform="rotate(-90)"
          class="aui-scroll-top__value"
        />
      </g>
    </svg>
    <button v-if="progress >= 0.95" class="aui-scroll-top__button" type="button" aria-label="Scroll to top" @click="scrollToTop">
      ↑
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWindowScroll } from '@vueuse/core'

const props = withDefaults(defineProps<{ radius?: number; stroke?: number }>(), {
  radius: 25,
  stroke: 5,
})

const { y } = useWindowScroll()
const circumference = computed(() => 2 * Math.PI * props.radius)
const dashArray = computed(() => `${circumference.value} ${circumference.value}`)
const progress = computed(() => {
  if (typeof window === 'undefined') return 0
  const doc = document.documentElement
  const total = (doc.scrollHeight || 0) - (window.innerHeight || 0)
  return total <= 0 ? 0 : Math.min(y.value / total, 1)
})
const dashOffset = computed(() => circumference.value * (1 - progress.value))

function scrollToTop() {
  if (typeof window === 'undefined') return
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<style scoped>
.aui-scroll-top {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(14, 165, 160, 0.75);
}

.aui-scroll-top__button {
  position: absolute;
  inset: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  color: currentColor;
}

.aui-scroll-top__track {
  color: rgba(15, 23, 42, 0.12);
}
</style>

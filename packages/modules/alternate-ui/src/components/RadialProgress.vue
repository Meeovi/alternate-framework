<template>
  <svg :height="radius * 2" :width="radius * 2" class="aui-radial-progress">
    <circle
      class="aui-radial-progress__track"
      :stroke-width="stroke"
      fill="transparent"
      :r="normalizedRadius"
      :cx="radius"
      :cy="radius"
    />
    <circle
      class="aui-radial-progress__value"
      :stroke-dasharray="`${circumference} ${circumference}`"
      :style="{ strokeDashoffset }"
      :stroke-width="stroke"
      fill="transparent"
      :r="normalizedRadius"
      :cx="radius"
      :cy="radius"
    />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    radius?: number
    progress?: number
    stroke?: number
  }>(),
  {
    radius: 50,
    progress: 0,
    stroke: 10,
  },
)

const normalizedRadius = computed(() => props.radius - props.stroke * 2)
const circumference = computed(() => normalizedRadius.value * 2 * Math.PI)
const strokeDashoffset = computed(() => circumference.value - props.progress * circumference.value)
</script>

<style scoped>
.aui-radial-progress__track,
.aui-radial-progress__value {
  transform: rotate(-90deg);
  transform-origin: 50% 50%;
  transition: stroke-dashoffset 0.25s ease;
}

.aui-radial-progress__track {
  stroke: rgba(15, 23, 42, 0.12);
}

.aui-radial-progress__value {
  stroke: currentColor;
}
</style>

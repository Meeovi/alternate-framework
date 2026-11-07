<template>
  <div class="vibe-product-pins" aria-live="polite">
    <TransitionGroup name="vibe-pin">
      <div v-for="pin in pins" :key="pin.id" class="vibe-product-pins__pin">
        <vibeProductMini :product="pin.product" dark />
        <v-btn class="vibe-product-pins__close" icon="fas fa-xmark" size="x-small" variant="flat" color="black"
          aria-label="Hide this product" @click="dismiss(pin.id)" />
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { toRef } from 'vue'
import vibeProductMini from './vibeProductMini.vue'
import { useActivePins, type VibeProduct } from '../../../../composables/vibez/useVibeProducts'

/**
 * The product cards that pop up over a shoppable vibe while it plays (the
 * player's overlay slot): the tagged products whose moment it is.
 */
const props = defineProps<{ items: VibeProduct[], time: number }>()
const { pins, dismiss } = useActivePins(toRef(props, 'items'), toRef(props, 'time'))
</script>

<style scoped>
.vibe-product-pins {
  position: absolute;
  left: 12px;
  bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: min(360px, calc(100% - 24px));
  pointer-events: none;
}

.vibe-product-pins__pin {
  position: relative;
  pointer-events: auto;
}

.vibe-product-pins__close {
  position: absolute;
  top: -8px;
  right: -8px;
}

.vibe-pin-enter-active,
.vibe-pin-leave-active {
  transition: opacity 0.25s, transform 0.25s;
}

.vibe-pin-enter-from,
.vibe-pin-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

@media (prefers-reduced-motion: reduce) {
  .vibe-pin-enter-active,
  .vibe-pin-leave-active {
    transition: none;
  }
}
</style>

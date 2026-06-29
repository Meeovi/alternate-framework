<template>
  <transition name="burst">
    <div v-if="show" class="burst"></div>
  </transition>
</template>

<script setup>
import { ref } from 'vue'

const show = ref(false)

export function triggerBurst() {
  show.value = true
  setTimeout(() => (show.value = false), 300)
}
</script>

<style scoped>
.burst {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #00ba7c;
  opacity: 0.4;
  position: absolute;
  transform: scale(0);
  animation: burstAnim 0.3s ease-out forwards;
}

@keyframes burstAnim {
  to {
    transform: scale(2.5);
    opacity: 0;
  }
}
</style>

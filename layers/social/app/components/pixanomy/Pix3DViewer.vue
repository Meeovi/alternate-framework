<template>
  <div class="pix-3d">
    <TresCanvas
      :window-size="false"
      clear-color="#0f1115"
    >
      <TresPerspectiveCamera :position="[3, 2, 3]" :fov="45" />
      <!-- RoomEnvironment (set in Pix3DScene) does most of the lighting;
           these just add a key direction and lift the shadows. -->
      <TresAmbientLight :intensity="0.4" />
      <TresDirectionalLight :position="[5, 8, 5]" :intensity="2.5" />
      <TresGridHelper :args="[20, 20]" />
      <Pix3DScene :url="url" @status="status = $event" />
    </TresCanvas>

    <div v-if="status !== 'ready'" class="pix-3d__overlay">
      <template v-if="status === 'error'">
        <v-icon icon="fas fa-cube" size="40" class="mb-2" />
        <div class="text-body-2">Couldn't render this model.</div>
        <div class="text-caption">Use "Open original" below to download it.</div>
      </template>
      <template v-else>
        <v-progress-circular indeterminate />
        <div class="text-caption mt-2">Loading 3D model…</div>
      </template>
    </div>

    <div v-if="status === 'ready'" class="pix-3d__hint text-caption">
      Drag to orbit · scroll to zoom
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Pix3DScene from './Pix3DScene.vue'

defineProps<{ url: string }>()

const status = ref<'loading' | 'ready' | 'error'>('loading')
</script>

<style scoped>
.pix-3d {
  position: relative;
  width: 100%;
  height: 60vh;
  min-height: 320px;
  background: #0f1115;
}

.pix-3d__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 16px;
  color: rgba(255, 255, 255, 0.85);
  pointer-events: none;
}

.pix-3d__hint {
  position: absolute;
  left: 50%;
  bottom: 10px;
  transform: translateX(-50%);
  padding: 2px 10px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.45);
  color: rgba(255, 255, 255, 0.8);
  pointer-events: none;
}
</style>

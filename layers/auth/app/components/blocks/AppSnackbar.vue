<script setup lang="ts">
const { active, remove } = useSnackbar()
</script>

<template>
  <div class="app-snackbar-container">
    <transition-group
      name="slide-fade"
      tag="div"
      class="snackbar-stack"
    >
      <v-snackbar
        v-for="snack in active"
        :key="snack.id"
        v-model:active="true"
        :color="snack.color"
        :timeout="snack.timeout"
        location="bottom right"
        class="mb-2"
        @click="remove(snack.id)"
      >
        {{ snack.message }}
      </v-snackbar>
    </transition-group>
  </div>
</template>

<style scoped>
.app-snackbar-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.25s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>

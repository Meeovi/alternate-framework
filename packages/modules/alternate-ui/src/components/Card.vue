<template>
  <section :class="classes">
    <header v-if="$slots.header" class="aui-card__header">
      <slot name="header" />
    </header>
    <div class="aui-card__body">
      <slot />
    </div>
    <footer v-if="$slots.footer" class="aui-card__footer">
      <slot name="footer" />
    </footer>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    elevated?: boolean
    padded?: boolean
  }>(),
  {
    elevated: false,
    padded: true,
  },
)

const classes = computed(() => [
  'aui-card',
  {
    'aui-card--elevated': props.elevated,
    'aui-card--padded': props.padded,
  },
])
</script>

<style scoped>
.aui-card {
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 1rem;
  background: #fff;
}

.aui-card--elevated {
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
}

.aui-card--padded .aui-card__header,
.aui-card--padded .aui-card__body,
.aui-card--padded .aui-card__footer {
  padding: 1rem;
}

.aui-card__header,
.aui-card__footer {
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
}

.aui-card__footer {
  border-top: 1px solid rgba(15, 23, 42, 0.06);
  border-bottom: 0;
}
</style>

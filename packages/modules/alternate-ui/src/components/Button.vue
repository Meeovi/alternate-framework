<template>
  <button :class="classes" :type="type" :disabled="disabled">
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    variant?: 'solid' | 'outline' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    block?: boolean
  }>(),
  {
    variant: 'solid',
    size: 'md',
    type: 'button',
    disabled: false,
    block: false,
  },
)

const classes = computed(() => [
  'aui-button',
  `aui-button--${props.variant}`,
  `aui-button--${props.size}`,
  {
    'aui-button--block': props.block,
    'is-disabled': props.disabled,
  },
])
</script>

<style scoped>
.aui-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: 1px solid transparent;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

.aui-button--sm {
  min-height: 2rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

.aui-button--md {
  min-height: 2.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.9375rem;
}

.aui-button--lg {
  min-height: 3rem;
  padding: 0.75rem 1.25rem;
  font-size: 1rem;
}

.aui-button--solid {
  background: #1f88d6;
  color: #fff;
}

.aui-button--outline {
  background: transparent;
  border-color: rgba(15, 23, 42, 0.16);
  color: #0f172a;
}

.aui-button--ghost {
  background: transparent;
  color: #0f172a;
}

.aui-button--block {
  width: 100%;
}

.is-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>

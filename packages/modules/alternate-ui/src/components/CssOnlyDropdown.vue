<template>
  <div class="aui-dropdown">
    <input :id="toggleId" type="checkbox" class="aui-dropdown__toggle" :aria-label="`Toggle ${label}`" />
    <label :for="toggleId" class="aui-dropdown__trigger">
      <slot name="trigger">
        <span>{{ label }}</span>
        <span class="aui-dropdown__chevron" aria-hidden="true">▾</span>
      </slot>
    </label>
    <div class="aui-dropdown__menu">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { createUID } from '../utils'

const props = withDefaults(
  defineProps<{
    label?: string
    id?: string
  }>(),
  {
    label: 'Menu',
    id: undefined,
  },
)

const toggleId = computed(() => props.id || createUID('aui-dropdown'))
</script>

<style scoped>
.aui-dropdown {
  position: relative;
  display: inline-block;
}

.aui-dropdown__toggle {
  display: none;
}

.aui-dropdown__trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem 0.75rem;
  border-radius: 0.75rem;
}

.aui-dropdown__trigger:hover {
  background: rgba(15, 23, 42, 0.05);
}

.aui-dropdown__menu {
  display: none;
  position: absolute;
  right: 0;
  top: calc(100% + 0.5rem);
  min-width: 12rem;
  overflow: hidden;
  border-radius: 0.75rem;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: #fff;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.12);
  z-index: 20;
}

.aui-dropdown__toggle:checked ~ .aui-dropdown__menu {
  display: block;
}

.aui-dropdown__menu :deep(a),
.aui-dropdown__menu :deep(button) {
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  background: transparent;
  border: 0;
  text-align: left;
}

.aui-dropdown__menu :deep(a:hover),
.aui-dropdown__menu :deep(button:hover) {
  background: rgba(15, 23, 42, 0.05);
}
</style>

<template>
  <div v-if="isVisible" class="dotdigital-chat-root">
    <button
      class="dotdigital-chat-launcher"
      type="button"
      :aria-expanded="String(state.isOpen)"
      aria-controls="dotdigital-chat-panel"
      @click="toggle"
    >
      <span class="dotdigital-chat-launcher__label">Chat</span>
    </button>

    <section
      v-if="showFallbackPanel"
      id="dotdigital-chat-panel"
      class="dotdigital-chat-panel"
      aria-live="polite"
    >
      <header class="dotdigital-chat-panel__header">
        <strong>Customer Support</strong>
        <button class="dotdigital-chat-panel__close" type="button" aria-label="Close chat" @click="close">x</button>
      </header>

      <div class="dotdigital-chat-panel__body">
        <p v-if="state.status === 'loading'">Loading chat widget...</p>
        <p v-else-if="state.error">{{ state.error }}</p>
        <p v-else>
          Chat is ready. If the embedded widget does not open automatically, use the button below.
        </p>

        <button
          v-if="externalUrl"
          class="dotdigital-chat-panel__action"
          type="button"
          @click="openExternalLink"
        >
          Open Chat
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import useDotdigitalChat from '../../../composables/content/useDotdigitalChat'

const { state, initialize, toggle, close, canUseExternalWidget } = useDotdigitalChat()

onMounted(() => {
  void initialize()
})

const isVisible = computed(() => Boolean(state.value.config?.enabled))
const showFallbackPanel = computed(() => state.value.isOpen && !canUseExternalWidget())
const externalUrl = computed(() => state.value.config?.launcherUrl || state.value.config?.scriptUrl || null)

function openExternalLink() {
  if (!externalUrl.value) return
  window.open(externalUrl.value, '_blank', 'noopener,noreferrer')
}
</script>

<style scoped>
.dotdigital-chat-root {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  z-index: 2147483000;
}

.dotdigital-chat-launcher {
  border: 0;
  border-radius: 999px;
  background: #0f766e;
  color: #fff;
  cursor: pointer;
  font: inherit;
  font-weight: 700;
  min-width: 4.5rem;
  padding: 0.85rem 1.1rem;
  box-shadow: 0 12px 30px rgba(15, 118, 110, 0.28);
}

.dotdigital-chat-launcher:hover {
  background: #115e59;
}

.dotdigital-chat-panel {
  position: absolute;
  right: 0;
  bottom: 4.5rem;
  width: min(22rem, calc(100vw - 2rem));
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: 1rem;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.18);
  overflow: hidden;
}

.dotdigital-chat-panel__header {
  align-items: center;
  background: #f8fafc;
  display: flex;
  justify-content: space-between;
  padding: 0.9rem 1rem;
}

.dotdigital-chat-panel__close {
  border: 0;
  background: transparent;
  color: #334155;
  cursor: pointer;
  font: inherit;
  font-size: 1rem;
}

.dotdigital-chat-panel__body {
  color: #334155;
  padding: 1rem;
}

.dotdigital-chat-panel__action {
  border: 0;
  border-radius: 0.75rem;
  background: #0f172a;
  color: #fff;
  cursor: pointer;
  font: inherit;
  font-weight: 600;
  margin-top: 0.75rem;
  padding: 0.7rem 0.95rem;
}

@media (max-width: 640px) {
  .dotdigital-chat-root {
    right: 0.75rem;
    bottom: 0.75rem;
  }

  .dotdigital-chat-panel {
    bottom: 4rem;
  }
}
</style>
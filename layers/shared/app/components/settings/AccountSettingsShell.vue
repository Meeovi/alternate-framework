<template>
  <div class="win11-settings">
    <v-card class="settings-shell" elevation="0">
      <div class="shell-bg"></div>

      <div class="settings-header">
        <div>
          <h1 class="settings-title">{{ title }}</h1>
          <p class="settings-subtitle">{{ subtitle }}</p>
        </div>
        <slot name="header-right" />
      </div>

      <slot name="alerts" />

      <div class="settings-body" :class="{ 'settings-body--hidden': bodyHidden }">
        <aside class="settings-sidebar">
          <slot name="sidebar" />
        </aside>

        <section class="settings-content">
          <slot name="content" />
        </section>
      </div>
    </v-card>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    subtitle?: string
    bodyHidden?: boolean
  }>(),
  {
    title: 'Settings',
    subtitle: 'Manage your account experience',
    bodyHidden: false,
  },
)
</script>

<style scoped>
.win11-settings {
  padding: 12px;
}

.settings-shell {
  position: relative;
  overflow: hidden;
  border-radius: 22px;
  border: 1px solid rgba(128, 128, 128, 0.2);
  background: linear-gradient(145deg, #f5f8ff 0%, #ffffff 42%, #eef7ff 100%);
  padding: 18px;
}

.shell-bg {
  position: absolute;
  inset: -120px -120px auto auto;
  width: 320px;
  height: 320px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 120, 212, 0.2), rgba(0, 120, 212, 0));
  pointer-events: none;
}

.settings-header {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.settings-title {
  font-size: 1.6rem;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: 0.2px;
  margin: 0;
}

.settings-subtitle {
  margin: 4px 0 0;
  color: rgba(60, 60, 67, 0.75);
  font-size: 0.92rem;
}

.settings-body {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 14px;
  margin-top: 14px;
}

.settings-body--hidden {
  display: none;
}

.settings-sidebar,
.settings-content {
  border-radius: 18px;
  border: 1px solid rgba(128, 128, 128, 0.17);
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(9px);
}

.settings-content {
  padding: 16px;
  display: grid;
  gap: 10px;
}

@media (max-width: 960px) {
  .settings-body {
    grid-template-columns: 1fr;
  }

  .settings-sidebar {
    order: 2;
  }

  .settings-content {
    order: 1;
  }
}
</style>

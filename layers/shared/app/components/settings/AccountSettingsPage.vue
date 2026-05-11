<template>
  <div>
    <AccountSettingsShell :title="title" :subtitle="subtitle" :body-hidden="!canShowSettingsBody">
      <template-right>
        <v-chip v-if="isLoggedIn" color="primary" variant="tonal" size="small">
          {{ userEmail }}
        </v-chip>
        <slot name="header-right" />

        <template #alerts>
          <v-alert v-if="!isLoggedIn" type="info" variant="tonal" title="Sign in required"
            text="Sign in to save settings to your account." />

          <v-alert v-else-if="!supportsPersistentSettings" type="warning" variant="tonal" title="Settings unavailable"
            :text="`This auth backend (${backendLabel}) does not support persisted account settings.`" />

          <slot name="alerts" />
        </template>

        <template #sidebar>
          <v-list nav density="comfortable" class="settings-nav">
            <v-list-item v-for="category in visibleCategories" :key="category.id"
              :active="activeCategory === category.id" :prepend-icon="category.icon" :title="category.label"
              rounded="lg" @click="activeCategory = category.id" />
          </v-list>
          <slot name="sidebar" />
        </template>

        <template #content>
          <div class="category-head">
            <h2>{{ activeCategoryLabel }}</h2>
            <p class="text-medium-emphasis">Changes save to your account automatically.</p>
          </div>

          <v-card v-for="setting in visibleSettingsForActiveCategory" :key="setting.key" class="setting-row"
            elevation="0" rounded="xl">
            <div class="setting-copy">
              <div class="setting-label">{{ setting.label }}</div>
              <div class="setting-description">{{ setting.description }}</div>
            </div>

            <div class="setting-actions">
              <v-progress-circular v-if="savingKey === setting.key" size="18" width="2" indeterminate color="primary" />
              <v-switch :model-value="getSettingValue(setting.key, setting.defaultValue)" color="primary" hide-details
                inset :disabled="savingKey === setting.key"
                @update:model-value="toggleSetting(setting.key, $event, setting.defaultValue)" />
            </div>
          </v-card>

          <v-alert v-if="saveError" type="error" variant="tonal" :text="saveError" />
          <v-alert v-if="saveSuccess" type="success" variant="tonal" :text="saveSuccess" />
          <slot name="content-bottom" />
        </template>
    </AccountSettingsShell>
  </div>
</template>

<script setup lang="ts">
  import {
    type AccountSettingDefinition,
    type AccountSettingsCategoryDefinition,
    type AccountSettingsPresetKey,
  } from '../../../../auth/app/composables/config/accountSettings'
  import { useAccountSettings } from '../../../../auth/app/composables/useAccountSettings'
  import AccountSettingsShell from './AccountSettingsShell.vue'

  const props = withDefaults(defineProps < {
    title ? : string
    subtitle ? : string
    preset ? : AccountSettingsPresetKey
    categories ? : AccountSettingsCategoryDefinition[]
    settings ? : AccountSettingDefinition[]
  } > (), {
    title: 'Settings',
    subtitle: 'Manage your account experience',
    preset: 'default',
    categories: undefined,
    settings: undefined,
  })

  const {
    isLoggedIn,
    userEmail,
    backendLabel,
    supportsPersistentSettings,
    activeCategory,
    savingKey,
    saveError,
    saveSuccess,
    visibleCategories,
    activeCategoryLabel,
    visibleSettingsForActiveCategory,
    getSettingValue,
    toggleSetting,
  } = useAccountSettings({
    preset: props.preset,
    categories: props.categories,
    settings: props.settings,
  })

  const canShowSettingsBody = computed(() => isLoggedIn.value && supportsPersistentSettings.value)

  const emit = defineEmits<{
  'setting:key': [value: boolean]
}>()
</script>

<style scoped>
  .settings-nav {
    padding: 8px;
    background: transparent;
  }

  .category-head h2 {
    margin: 0;
    font-size: 1.15rem;
    font-weight: 700;
  }

  .setting-row {
    border: 1px solid rgba(128, 128, 128, 0.18);
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.95);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding: 12px 14px;
  }

  .setting-copy {
    min-width: 0;
  }

  .setting-label {
    font-size: 0.98rem;
    font-weight: 650;
    line-height: 1.2;
  }

  .setting-description {
    color: rgba(60, 60, 67, 0.7);
    margin-top: 4px;
    font-size: 0.86rem;
  }

  .setting-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }
</style>
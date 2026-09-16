<script setup lang="ts">
import { ref } from 'vue'
import { Grid, Toolbar, ContextMenu, HeaderMenu, Willow } from '@svar-ui/vue-grid'
import '@svar-ui/vue-grid/all.css'
import type { IColumnConfig } from '@svar-ui/vue-grid'

withDefaults(defineProps<{
  columns: IColumnConfig[]
  data: Record<string, unknown>[]
  pending?: boolean
  error?: unknown
  height?: string
}>(), {
  pending: false,
  error: null,
  height: '560px'
})

const api = ref()
</script>

<template>
  <NuxtErrorBoundary>
    <Willow>
      <div class="seller-data-grid" :style="{ height }">
        <v-alert v-if="error" type="error" variant="tonal" density="compact" class="seller-data-grid__error">
          Couldn't load this data. {{ (error as any)?.statusMessage || (error as any)?.message || '' }}
        </v-alert>

        <Toolbar :api="api" />

        <div class="seller-data-grid__body">
          <div v-if="pending" class="seller-data-grid__loading">
            <v-progress-circular indeterminate color="primary" size="32" />
          </div>

          <ContextMenu v-else :api="api">
            <HeaderMenu :api="api">
              <Grid
                ref="api"
                :data="data"
                :columns="columns"
                multiselect
                reorder
                undo
                footer
              />
            </HeaderMenu>
          </ContextMenu>
        </div>
      </div>
    </Willow>

    <!--
      Catches a client-side render crash inside the grid itself (a bad
      column formatter, a third-party SVAR bug, ...) — separate from the
      `error` prop above, which only covers the data *fetch* failing.
      Doesn't catch SSR-time errors (NuxtErrorBoundary only registers its
      onErrorCaptured hook on the client — see its own source), so a crash
      during the initial server render still surfaces as a full page
      error; this protects the far more common case of it happening after
      hydration (sorting, editing a cell, re-rendering on data change).
    -->
    <template #error="{ error: renderError, clearError }">
      <v-alert type="warning" variant="tonal" density="compact" class="seller-data-grid__error">
        This section isn't working right now.
        <v-btn size="small" variant="text" class="ml-2" @click="clearError">Retry</v-btn>
        <div v-if="renderError" class="seller-data-grid__error-detail">
          {{ (renderError as any)?.message || String(renderError) }}
        </div>
      </v-alert>
    </template>
  </NuxtErrorBoundary>
</template>

<style scoped>
.seller-data-grid {
  display: flex;
  flex-direction: column;
}

.seller-data-grid__error {
  margin-bottom: 8px;
}

.seller-data-grid__body {
  flex: 1;
  min-height: 0;
}

.seller-data-grid__loading {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.seller-data-grid__error-detail {
  font-size: 0.75rem;
  opacity: 0.7;
  margin-top: 4px;
}
</style>

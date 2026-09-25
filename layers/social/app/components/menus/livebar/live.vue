<template>
    <div class="livebar">
        <!-- One item per vibe, laid out in a single horizontally scrolling
             row (arrows appear when it overflows). Previously every vibe
             sat inside one v-tab, so they stacked vertically. -->
        <v-slide-group class="vibez-row" show-arrows>
            <v-slide-group-item v-if="session.data?.user">
                <div class="vibez-item">
                    <v-dialog v-model="createdialog" transition="dialog-bottom-transition">
                        <template v-slot:activator="{ props }">
                            <v-avatar icon="fas fa-video" size="60" class="vibez-create" role="button"
                                aria-label="Create a vibe" v-bind="props"></v-avatar>
                        </template>

                        <template v-slot:default="{ isActive }">
                            <v-card color="white">
                                <addlive />

                                <v-card-actions>
                                    <v-spacer></v-spacer>

                                    <v-btn text="Close" @click="isActive.value = false"></v-btn>
                                </v-card-actions>
                            </v-card>
                        </template>
                    </v-dialog>
                </div>
            </v-slide-group-item>

            <v-slide-group-item v-for="item in short" :key="item.id">
                <div class="vibez-item">
                    <!-- The creator's avatar (users.image); fas fa-user when
                         they haven't set one or the vibe has no creator_id. -->
                    <button type="button" class="avatarBorder vibez-bubble" :title="vibeLabel(item)"
                        :aria-label="`Watch ${vibeLabel(item)}`" @click="openVibe(item)">
                        <v-avatar size="60" color="surface-variant">
                            <v-img v-if="avatarFor(item)" :src="avatarFor(item)" :alt="item?.creator || ''" cover />
                            <v-icon v-else icon="fas fa-user" size="28" />
                        </v-avatar>
                    </button>
                </div>
            </v-slide-group-item>
        </v-slide-group>

        <v-dialog v-model="dialog" max-width="1100" transition="dialog-bottom-transition">
            <v-card min-height="75%" min-width="75%" class="vibe-dialog-card">
                <!-- Instagram-style step through the reel without
                     closing the dialog. Keyed on the id so the vibe
                     component (which only fetches on mount) reloads. -->
                <v-btn
                    v-show="hasPrevVibe"
                    icon="fas fa-chevron-left"
                    size="small"
                    class="vibe-nav vibe-nav--prev"
                    aria-label="Previous vibe"
                    @click="goVibe(-1)"
                />
                <v-btn
                    v-show="hasNextVibe"
                    icon="fas fa-chevron-right"
                    size="small"
                    class="vibe-nav vibe-nav--next"
                    aria-label="Next vibe"
                    @click="goVibe(1)"
                />

                <vibe :key="selectedShortId" :vibe="selectedShortId" />

                <v-card-actions>
                    <v-btn color="primary" block @click="dialog = false">Close</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup>
    import { authClient } from '#auth/lib/auth-client'
    import vibe from '#social/app/pages/connect/vibe/[...id].vue'
    import addlive from '#social/app/components/features/vibeSections/add-live.vue'
    import {
        ref,
        computed,
        watch,
        onBeforeUnmount
    } from 'vue';

  const { $sdk, $directus, $readItems } = useNuxtApp()

  // authClient.useSession() returns the Vue ref itself, not a {data,...}
  // object — see BottomFooter.vue's comment on the same bug.
  const session = authClient.useSession()

  const createdialog = ref(false);
  const dialog = ref(false);
  // `vibe` (pages/connect/vibe/[...id].vue) is embedded here as a dialog,
  // not navigated to — it previously fell back to reading route.params.id,
  // which is always empty on whatever page the livebar is showing on, so
  // every avatar opened the same broken "shorts/undefined" lookup no
  // matter which one was clicked.
  const selectedShortId = ref(null);

  // lazy: true — see LowerBar.vue's comment on the same pattern; this
  // component also renders in the default layout on nearly every page.
  const {
      data: short
  } = useAsyncData('short', async () => {
      const resp = await $directus.request($readItems('shorts', {
          fields: ['*', { '*': ['*'] }]
      }))
      return Array.isArray(resp) ? resp : []
  }, { lazy: true })

  // Creator avatars, looked up in one batch by creator_id (the Meeovi user
  // id stamped server-side when the vibe was created).
  const avatars = ref({});
  watch(short, async (list) => {
    const ids = [...new Set((list ?? []).map((s) => s?.creator_id).filter(Boolean))]
      .filter((id) => !(id in avatars.value));
    if (!ids.length) return;
    try {
      const found = await $fetch('/api/social/avatars', { query: { ids: ids.join(',') } });
      avatars.value = { ...avatars.value, ...found };
    } catch (e) {
      console.error('[livebar] avatar lookup failed', e);
    }
  }, { immediate: true });

  const avatarFor = (item) => (item?.creator_id && avatars.value[item.creator_id]) || null;
  const vibeLabel = (item) => [item?.name, item?.creator && `by ${item.creator}`].filter(Boolean).join(' ') || 'vibe';

  function openVibe(item) {
    selectedShortId.value = item?.id ?? null;
    dialog.value = true;
  }

  // Prev / next through the same `short` list the livebar renders.
  const vibeIndex = computed(() =>
    (short.value ?? []).findIndex((s) => String(s?.id) === String(selectedShortId.value))
  );
  const hasPrevVibe = computed(() => vibeIndex.value > 0);
  const hasNextVibe = computed(
    () => vibeIndex.value > -1 && vibeIndex.value < (short.value?.length ?? 0) - 1
  );

  function goVibe(step) {
    const next = (short.value ?? [])[vibeIndex.value + step];
    if (next) selectedShortId.value = next.id;
  }

  function onVibeKey(e) {
    if (e.key === 'ArrowLeft') goVibe(-1);
    else if (e.key === 'ArrowRight') goVibe(1);
  }

  watch(dialog, (open) => {
    if (import.meta.client) {
      if (open) window.addEventListener('keydown', onVibeKey);
      else window.removeEventListener('keydown', onVibeKey);
    }
  });

  onBeforeUnmount(() => {
    if (import.meta.client) window.removeEventListener('keydown', onVibeKey);
  });
</script>

<style scoped>
  .vibez-row {
      width: 100%;
      min-height: 80px;
  }

  .vibez-item {
      display: flex;
      align-items: center;
      padding: 6px 8px;
  }

  .vibez-bubble {
      display: inline-flex;
      padding: 0;
      background: none;
      cursor: pointer;
  }

  .vibez-create {
      cursor: pointer;
      background: rgb(var(--v-theme-info)) !important;
      color: white;
  }

  .vibe-dialog-card {
      position: relative;
  }

  .vibe-nav {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      z-index: 3;
      background: rgba(var(--v-theme-surface), 0.85);
      box-shadow: 0 1px 6px rgba(0, 0, 0, 0.3);
  }

  .vibe-nav--prev {
      left: 8px;
  }

  .vibe-nav--next {
      right: 8px;
  }
</style>
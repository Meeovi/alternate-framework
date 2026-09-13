<template>
    <div class="livebar">

        <v-card height="75" variant="text">
            <v-tabs v-model="tab" center-active height="75">
                <v-tab v-if="session?.user">
                    <div class="text-center">
                        <v-dialog v-model="createdialog" transition="dialog-bottom-transition">
                            <template v-slot:activator="{ props }">
                                <v-avatar icon="fas fa-plus"
                                    style="background: rgb(var(--v-theme-info))!important; color: white;" size="60"
                                    v-bind="props"></v-avatar>
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
                </v-tab>

                <v-tab>
                    <div class="text-center">
                        <div class="avatarBorder" v-for="(shorts, index) in short" :key="index">
                            <v-avatar size="60" style="cursor: pointer;" @click="openVibe(shorts)">
                                <NuxtImg provider="cloudinary" v-if="hasAsset(shorts?.thumbnail)" loading="lazy" :src="getAssetURL(shorts?.thumbnail)" :alt="shorts?.name" cover />

                                <NuxtImg provider="cloudinary" v-else src="/images/display-2.png" :alt="shorts?.name" cover />
                            </v-avatar>
                        </div>

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
                </v-tab>
            </v-tabs>
        </v-card>
    </div>
</template>

<script setup>
import { getAssetURL, hasAsset } from '#shared/app/utils/get-asset-url'
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

  const { data: session } = authClient.useSession()

  const tab = ref(null);
  const createdialog = ref(false);
  const dialog = ref(false);
  // `vibe` (pages/connect/vibe/[...id].vue) is embedded here as a dialog,
  // not navigated to — it previously fell back to reading route.params.id,
  // which is always empty on whatever page the livebar is showing on, so
  // every avatar opened the same broken "shorts/undefined" lookup no
  // matter which one was clicked.
  const selectedShortId = ref(null);

  const {
      data: short
  } = await useAsyncData('short', async () => {
      const resp = await $directus.request($readItems('shorts', {
          fields: ['*', { '*': ['*'] }]
      }))
      return Array.isArray(resp) ? resp : []
  })

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
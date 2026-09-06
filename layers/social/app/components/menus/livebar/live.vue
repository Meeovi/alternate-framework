<template>
    <div class="livebar">

        <v-card height="75" variant="text">
            <v-tabs v-model="tab" center-active height="75">
                <v-tab>
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

                        <v-dialog v-model="dialog" transition="dialog-bottom-transition">
                            <v-card min-height="75%" min-width="75%">
                                <vibe :vibe="selectedShortId" />

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
    import vibe from '#social/app/pages/connect/vibe/[...id].vue'
    import addlive from '#social/app/components/features/vibeSections/add-live.vue'
    import {
        ref
    } from 'vue';

  const { $sdk, $directus, $readItems } = useNuxtApp()

  const tab = ref(null);
  const createdialog = ref(false);
  const dialog = ref(false);
  // `vibe` (pages/connect/vibe/[...id].vue) is embedded here as a dialog,
  // not navigated to — it previously fell back to reading route.params.id,
  // which is always empty on whatever page the livebar is showing on, so
  // every avatar opened the same broken "shorts/undefined" lookup no
  // matter which one was clicked.
  const selectedShortId = ref(null);

  function openVibe(item) {
    selectedShortId.value = item?.id ?? null;
    dialog.value = true;
  }

  const {
      data: short
  } = await useAsyncData('short', async () => {
      const resp = await $directus.request($readItems('shorts', {
          fields: ['*', { '*': ['*'] }]
      }))
      return Array.isArray(resp) ? resp : []
  })
</script>
<template>
  <div class="pixPage">
    <v-row>
      <v-col cols="12">
        <v-card
          class="mx-auto"
          max-width="100%"
        >
          <v-img
            v-if="getAssetURL(pixPage?.image)"
            class="align-end text-white"
            height="200"
            :src="getAssetURL(pixPage?.image)"
            cover
          >
            <v-card-title style="text-align: center;">
              {{ pixPage?.name }}
            </v-card-title>
          </v-img>

          <v-img
            v-else
            class="align-end text-white"
            height="200"
            src="https://picsum.photos/1000/300"
            cover
          >
            <v-card-title style="text-align: center;">
              {{ pixPage?.name }}
            </v-card-title>
          </v-img>

          <v-card-text style="text-align: center;">
            <p v-dompurify-html="pixPage?.content" />
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-sheet elevation="2">
          <v-tabs
            v-model="tab"
            align-tabs="center"
          >
            <div
              v-for="(menu, index) in pixSubBar?.submenus"
              :key="index"
            >
              <v-tab :value="menu?.value">
                <v-btn variant="text">
                  {{ menu?.name }}
                </v-btn>
              </v-tab>
            </div>
          </v-tabs>

          <v-tabs-window
            v-model="tab"
            class="pixHomepageTabWindow"
          >
            <v-tabs-window-item :value="pixSubBar?.submenus?.[0]?.value">
              <v-sheet
                class="pa-5"
                color="purple"
              >
                <featured v-if="isTabMounted(pixSubBar?.submenus?.[0]?.value)" />
              </v-sheet>
            </v-tabs-window-item>
            <v-tabs-window-item :value="pixSubBar?.submenus?.[1]?.value">
              <v-sheet
                class="pa-5"
                color="orange"
              >
                <generativeAi v-if="isTabMounted(pixSubBar?.submenus?.[1]?.value)" />
              </v-sheet>
            </v-tabs-window-item>
            <v-tabs-window-item :value="pixSubBar?.submenus?.[2]?.value">
              <v-sheet
                class="pa-5"
                color="brown"
              >
                <imaging v-if="isTabMounted(pixSubBar?.submenus?.[2]?.value)" />
              </v-sheet>
            </v-tabs-window-item>
            <v-tabs-window-item :value="pixSubBar?.submenus?.[3]?.value">
              <v-sheet
                class="pa-5"
                color="green"
              >
                <pixVideo v-if="isTabMounted(pixSubBar?.submenus?.[3]?.value)" />
              </v-sheet>
            </v-tabs-window-item>
            <v-tabs-window-item :value="pixSubBar?.submenus?.[4]?.value">
              <v-sheet
                class="pa-5"
                color="blue"
              >
                <design v-if="isTabMounted(pixSubBar?.submenus?.[4]?.value)" />
              </v-sheet>
            </v-tabs-window-item>
            <v-tabs-window-item :value="pixSubBar?.submenus?.[5]?.value">
              <v-sheet
                class="pa-5"
                color="red"
              >
                <document v-if="isTabMounted(pixSubBar?.submenus?.[5]?.value)" />
              </v-sheet>
            </v-tabs-window-item>
            <v-tabs-window-item :value="pixSubBar?.submenus?.[6]?.value">
              <v-sheet
                class="pa-5"
                color="yellow"
              >
                <threeD v-if="isTabMounted(pixSubBar?.submenus?.[6]?.value)" />
              </v-sheet>
            </v-tabs-window-item>
          </v-tabs-window>
        </v-sheet>
      </v-col>
    </v-row>

    <!-- One shared preview dialog for every pixSection on this page.
         Sections emit `open` → usePixanomyViewer().open(item). -->
    <PixMediaViewer />
  </div>
</template>

<script setup>
import { getAssetURL } from '#shared/app/utils/get-asset-url'
import featured from '../../components/features/pixSections/featured.vue'
import generativeAi from '../../components/features/pixSections/generative-ai.vue'
import imaging from '../../components/features/pixSections/imaging.vue'
import pixVideo from '../../components/features/pixSections/video.vue'
import design from '../../components/features/pixSections/design.vue'
import document from '../../components/features/pixSections/document.vue'
import threeD from '../../components/features/pixSections/3d.vue'
import PixMediaViewer from '../../components/pixanomy/PixMediaViewer.vue'

const {
  $directus,
  $readItem
} = useNuxtApp()

const tab = ref(null)
const {
  data: pixPage
} = await useAsyncData('pixPage', () => {
  return $directus.request($readItem('pages', '194', {
    fields: ['*', {
      '*': ['*']
    }]
  }))
})

const {
  data: pixSubBar
} = await useAsyncData('pixSubBar', () => {
  return $directus.request($readItem('navigation', '137', {
    fields: ['*', {
      '*': ['*']
    }]
  }))
})

// Each section runs its own Directus-backed fetch on mount, and
// <v-tabs-window> renders every item eagerly — so without gating, opening
// Pixanomy fires all 7 section fetches at once. Only mount a section once
// its tab has been selected; keep it mounted afterwards so switching back
// is instant and doesn't refetch. The first tab is selected (and mounted)
// as soon as the submenu loads so the page isn't blank on arrival.
const mountedTabs = reactive(new Set())
const isTabMounted = value => value != null && value !== '' && mountedTabs.has(value)

watch(tab, value => {
  if (value != null && value !== '') mountedTabs.add(value)
})

watch(pixSubBar, value => {
  const first = value?.submenus?.[0]?.value
  if (first == null || first === '') return
  if (tab.value == null || tab.value === '') tab.value = first
  mountedTabs.add(first)
}, { immediate: true })

definePageMeta({
  layout: 'pix',
  // Pixanomy is the signed-in user's own digital-content hub — every
  // section below queries `media` filtered to the current user, so an
  // anonymous visitor has nothing to see. `auth` (layers/auth) redirects
  // to /login?redirect=… when there's no session.
  middleware: 'auth'
})

useHead({
  title: 'Pixanomy'
})
</script>

<style scoped>
  .pixHomepageTabWindow .v-sheet {
    min-height: 100vh !important;
    height: 100%;
  }
</style>

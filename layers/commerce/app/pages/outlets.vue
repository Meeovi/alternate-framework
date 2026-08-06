<template>
  <div class="contentPage">
    <v-card elevation="0">
      <v-toolbar :title="outletsBar?.name"
        :style="`background-color: ${outletsBar?.color}; color: ${outletsBar?.colortext}`"></v-toolbar>
      <v-tabs v-model="tab" :bg-color="outletsBar?.color">
        <v-tab v-if="outletsBar?.menus?.length" v-for="(menu, index) in outletsBar?.menus" :key="index" :value="index">
          <NuxtLink :to="menu?.url">{{ menu?.name }}</NuxtLink>
        </v-tab>
      </v-tabs>

      <v-card-text>
        <v-tabs-window v-model="tab">
          <v-tabs-window-item :value="0">
            <section data-bs-version="5.1" class="clients1 cid-uHg1k6KLf8" id="clients1-ap">
              <div class="container">
                <div class="row justify-content-center">
                  <div class="col-12 col-md-6 col-lg-4" style="padding-bottom: 10px;" v-for="(outlet, index) in shops" :key="index">
                    <outletCard :store="outlet" />
                  </div>
                </div>
              </div>
            </section>
          </v-tabs-window-item>

          <v-tabs-window-item :value="1">
            <section data-bs-version="5.1" class="clients1 cid-uHg1k6KLf8" id="clients1-ap">
              <div class="container">
                <div class="row justify-content-center">
                  <div class="col-12 col-md-6 col-lg-4" style="padding-bottom: 10px;" v-for="(outlet, index) in meeoviOutlets" :key="index">
                    <outletCard :store="outlet" />
                  </div>
                </div>
              </div>
            </section>
          </v-tabs-window-item>

          <v-tabs-window-item :value="2">
            <section data-bs-version="5.1" class="clients1 cid-uHg1k6KLf8" id="clients1-ap">
              <div class="container">
                <div class="row justify-content-center">
                  <div class="col-12 col-md-6 col-lg-4" style="padding-bottom: 10px;" v-for="(outlet, index) in localOutlets" :key="index">
                    <outletCard :store="outlet" />
                  </div>
                </div>
              </div>
            </section>
          </v-tabs-window-item>
        </v-tabs-window>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
  import {
    ref,
    watch,
    useAsyncData,
    useHead,
    useNuxtApp
  } from '#imports'
  import outletCard from '../components/catalog/outlets/outlet.vue'

  const tab = ref(null)
  const {
    $directus,
    $readItems,
    $readItem
  } = useNuxtApp()

  const {
    data: shops
  } = await useAsyncData('shops', async () => {
    return await $directus.request($readItems('shops'))
  })

  const {
    data: meeoviOutlets
  } = await useAsyncData('meeoviOutlets', async () => {
    return await $directus.request($readItems('departments', {
      fields: ['*', {
        '*': ['*']
      }],
      filter: {
        type: {
          _eq: 'outlet'
        }
      }
    }))
  })

  const {
    data: localOutlets
  } = await useAsyncData('localOutlets', async () => {
    return await $directus.request($readItems('shops', {
      fields: ['*', {
        '*': ['*']
      }]
    }))
  })

  const {
    data: outletsBar
  } = await useAsyncData('outletsBar', async () => {
    return await $directus.request($readItem('navigation', '127'))
  })

  // Auto-select the first tab when outletsBar loads
  watch(
    () => outletsBar.value?.menus,
    (menus) => {
      if (menus?.length && tab.value == null) {
        tab.value = 0
      }
    }, {
      immediate: true
    },
  )

  useHead({
    title: 'Outlets on Meeovi',
  })
</script>
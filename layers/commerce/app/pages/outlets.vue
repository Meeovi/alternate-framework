<template>
  <div class="contentPage">
    <v-card elevation="0">
      <v-toolbar title="Outlets on Meeovi" color="green"></v-toolbar>
      <v-tabs v-model="tab" bg-color="green" align-tabs="center">
        <v-tab v-if="outletbar?.active === 'Active'" v-for="(menu, index) in outletbar?.menus" :key="index">
          <NuxtLink :to="menu?.url">{{ menu?.name }}</NuxtLink>
        </v-tab>
      </v-tabs>

      <template>
        <v-tabs-window v-model="tab">
          <v-tabs-window-item :value="outletbar?.menus[0]?.value">
            <section data-bs-version="5.1" class="clients1 cid-uHg1k6KLf8" id="clients1-ap">
              <div class="container">
                <div class="row justify-content-center">
                  <div class="card col-12 col-md-6 col-lg-4" v-for="(outlet, index) in outlets" :key="index">
                    <outlet :outlet="outlet" />
                  </div>
                </div>
              </div>
            </section>
          </v-tabs-window-item>

          <v-tabs-window-item :value="outletbar?.menus[1]?.value">
            <section data-bs-version="5.1" class="clients1 cid-uHg1k6KLf8" id="clients1-ap">
              <div class="container">
                <div class="row justify-content-center">
                  <div class="card col-12 col-md-6 col-lg-4" v-for="(outlet, index) in outlets" :key="index">
                    <outlet :outlet="outlet" />
                  </div>
                </div>
              </div>
            </section>
          </v-tabs-window-item>

          <v-tabs-window-item :value="outletbar?.menus[2]?.value">
            <section data-bs-version="5.1" class="clients1 cid-uHg1k6KLf8" id="clients1-ap">
              <div class="container">
                <div class="row justify-content-center">
                  <div class="card col-12 col-md-6 col-lg-4" v-for="(outlet, index) in outlets" :key="index">
                    <outlet :outlet="outlet" />
                  </div>
                </div>
              </div>
            </section>
          </v-tabs-window-item>
        </v-tabs-window>
      </template>
    </v-card>
  </div>
</template>

<script setup>
  import { ref, useAsyncData, useHead, useNuxtApp } from '#imports'
  import outlet from '../components/catalog/outlets/outlets.vue'

  const tab = ref(null)
  const {
    $directus,
    $readItems,
    $readItem
  } = useNuxtApp()

  const { data: outlets } = await useAsyncData('outlets', async () => {
    return await $directus.request($readItems('outlets', {
            fields: ['*', {
                '*': ['*']
            }]
        }))
    })

  const {
    data: outletbar
  } = await useAsyncData('outletbar', async () => {
    return await $directus.request($readItem('outletbars', '55'))
  })

  useHead({
    title: 'Outlets on Meeovi',
  })
</script>
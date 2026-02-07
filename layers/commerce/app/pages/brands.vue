<template>
  <div class="contentPage">
    <v-card elevation="0">
      <v-toolbar :title="brandbar?.name" color="green"></v-toolbar>
      <v-tabs v-model="tab" bg-color="green">
        <div v-for="(menu, index) in brandbar?.menus" :key="index">
        <v-tab :value="menu?.value">{{ menu?.name }}</v-tab>
      </div>
      </v-tabs>

      <v-card-text>
        <v-tabs-window v-model="tab">
          <v-tabs-window-item value="one">
            <v-row>
              <v-col cols="4" v-for="brand in brands" :key="brand.brand_id">
                <brand :brand="brand" />
              </v-col>
            </v-row>
          </v-tabs-window-item>

          <v-tabs-window-item value="two">
            <v-row>
              <v-col cols="4" v-for="brand in meebrands" :key="brand.brand_id">
                <brand :brand="brand" />
              </v-col>
            </v-row>
          </v-tabs-window-item>

          <v-tabs-window-item value="three">
            <v-row>
              <v-col cols="4" v-for="brand in brands" :key="brand.brand_id">
                <brand :brand="brand" />
              </v-col>
            </v-row>
          </v-tabs-window-item>
        </v-tabs-window>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
  import {
    ref,
    onMounted
  } from 'vue'
  import brand from '~/app/components/catalog/product/brands.vue'

  const tab = ref(null)
  import useDirectusRequest from '#shared/app/composables/useDirectusRequest'
  const { readItems, readItem, getAssetUrl } = useDirectusRequest()

  const { data: brands } = await useAsyncData('brands', async () => {
    const resp = await readItems('brands', { fields: ['*', { '*': ['*'] }] })
    return resp?.data || resp || []
  })

  const { data: meebrands } = await useAsyncData('meebrands', async () => {
    const resp = await readItems('brands', { filter: { code: { _eq: 'Mee' } }, fields: ['*', { '*': ['*'] }] })
    return resp?.data || resp || []
  })

  const { data: brandbar } = await useAsyncData('brandbar', async () => {
    const resp = await readItem('navigation', '40', { fields: ['*', { '*': ['*'] }] })
    return resp?.data || resp || null
  })
</script>
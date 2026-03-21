<template>
  <div class="contentPage">
    <v-card elevation="0">
      <v-toolbar :title="brandbar?.name" color="green"></v-toolbar>
      <v-tabs v-model="tab" bg-color="green">
        <div v-for="(menu, index) in brandbar?.menus" :key="index">
        <v-tab :value="menu?.value">{{ menu?.name }}</v-tab>
      </div>
      </v-tabs>

      <template #header>
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
      </template>
    </v-card>
  </div>
</template>

<script setup>
import { useCommerceAdapter, useContentAdapter } from '#imports'
void useCommerceAdapter()
void useContentAdapter()
import { ref } from '#imports'
import brand from '../components/related/brandCard.vue'

const tab = ref(null)

const { getBrands, getMeeBrands } = useCommerceAdapter()
const { getBrandBar } = useContentAdapter()

const { data: brands } = await useAsyncData('brands', getBrands)
const { data: meebrands } = await useAsyncData('meebrands', getMeeBrands)
const { data: brandbar } = await useAsyncData('brandbar', getBrandBar)

</script>
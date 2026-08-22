<template>
  <div class="accountPage" v-if="brand">
    <section data-bs-version="5.1" class="info3 cid-tuzqZ1PJf1" id="info3-39"
      :style="`background-image: url(${$directus.url}/assets/${brand.image?.filename_disk});`">
      <div class="mbr-overlay" style="opacity: 0.6; background-color: rgb(68, 121, 217);">
      </div>
      <div class="container">
        <div class="row justify-content-center">
          <div class="card col-12 col-lg-10">
            <div class="card-wrapper">
              <div class="card-box align-center">
                <h4 class="card-title mbr-fonts-style align-center mb-4 display-1">
                  <strong>{{ brand.name }}</strong>
                </h4>
                <p class="mbr-text mbr-fonts-style mb-4 display-7">{{ brand.code }}</p>
                <p class="mbr-text mbr-fonts-style mb-4 display-7" v-html="brand.description"></p>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!--Brand Shorts-->
    <v-sheet class="mx-auto sliderProducts row align-items-stretch items-row justify-content-center"
      v-if="brand?.shorts?.length">
      <v-slide-group v-model="model" class="pa-4" selected-class="bg-success" show-arrows>
        <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }" v-for="shorts in brand?.shorts"
          :key="shorts">
          <shortCard :short="shorts?.shorts_id" :class="['ma-4', selectedClass]" @click="toggle" />
          <div class="d-flex fill-height align-center justify-center">
            <v-scale-transition>
              <v-icon v-if="isSelected" color="white" icon="fas fa-circle-xmark" size="48"></v-icon>
            </v-scale-transition>
          </div>
        </v-slide-group-item>
      </v-slide-group>
    </v-sheet>

    <!--Brand Products-->
    <v-row style="padding: 10px;">
      <v-col cols="3" v-for="brand in brand?.products" :key="brand.id">
        <productCard :product="brand?.products_id" />
      </v-col>
    </v-row>

    <relatedbrands />
  </div>
  <div v-else>
    Loading brand...
  </div>
</template>

<script setup>
  import {
    ref,
    onMounted
  } from 'vue'
  import shortCard from '#social/app/components/features/vibeSections/shorts.vue'
  import productCard from '../../components/catalog/product/productCard.vue'
  import relatedbrands from '../../components/catalog/product/relatedbrands.vue'
  import {
    useRuntimeConfig
  } from 'nuxt/app';

  const config = useRuntimeConfig();
  const route = useRoute();
  const {
    $directus,
    $readItem,
    $readItems
  } = useNuxtApp()

  const {
    data: brand
  } = await useAsyncData('brand', async () => {
    const result = await $directus.request($readItems('brands', {
      fields: ['*',
        'shorts.shorts_id.*',
        'products.products_id.*',
        'image.*'
      ],
      filter: {
        slug: {
          _eq: `${route.params.slug}`
        }
      },
      limit: 1
    }))
    return Array.isArray(result) ? result[0] : null
  })

  definePageMeta({
    layout: 'nolive',
  });

  useHead({
    title: computed(() => brand.value?.name || 'Brand Page')
  })
</script>
<template>
  <div>
    <section data-bs-version="5.1" class="mbr-section features20 cid-txNnCwzel4" id="features20-4t"
      data-sortbtn="btn-primary">
      <div class="container-fluid">
        <h2 class="mbr-section-title align-left mbr-fonts-style display-5">
          Exclusives</h2>
        <div class="underline align-left pb-3">
          <div class="line"></div>
        </div>
        <v-sheet class="mx-auto sliderProducts row align-items-stretch items-row justify-content-center">
          <v-slide-group v-model="model" class="pa-4" selected-class="bg-success" show-arrows>
            <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }" v-for="(products, index) in exclusives"
              :key="index">
              <productCard :product="products?.products_id" :class="['ma-4', selectedClass]" @click="toggle" />

              <div class="d-flex fill-height align-center justify-center">
                <v-scale-transition>
                  <v-icon v-if="isSelected" color="white" icon="mdi-close-circle-outline" size="48"></v-icon>
                </v-scale-transition>
              </div>
            </v-slide-group-item>
          </v-slide-group>
        </v-sheet>
      </div>
    </section>
  </div>
</template>

<script setup>
  import productCard from './productCard.vue'

  const model = ref(null);
  const { $directus, $readItems, $commerce } = useNuxtApp()

  const { data: exclusives } = await useAsyncData('exclusives', async () => {
    const refs = await $directus.request($readItems('products', {
      fields: ['id', 'sku'],
      limit: 10,
      filter: {
        status: { _eq: 'published' },
        departments: {
          departments_id: { name: { _eq: 'Exclusives' } }
        }
      }
    }))

    const products = await Promise.all(refs.map(async (r) => {
      try {
        return await $commerce.getProduct(String(r.sku || r.id))
      } catch (e) {
        return null
      }
    }))

    return products.filter(Boolean)
  })
</script>
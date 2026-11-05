<template>
  <!-- Products and content by Sebastian Hilton and Meeovi
       (/api/commerce/home/exclusives). On the home page a slider of each;
       on the Exclusives department (`page`) the products as a grid. -->
  <div v-if="products.length || content.length">
    <section data-bs-version="5.1" class="mbr-section features20 cid-txNnCwzel4" id="features20-4t"
      data-sortbtn="btn-primary">
      <div class="container-fluid">
        <h2 v-if="!page" class="mbr-section-title align-left mbr-fonts-style display-5">
          Exclusives</h2>
        <div v-if="!page" class="underline align-left pb-3">
          <div class="line"></div>
        </div>

        <v-row v-if="page && products.length" class="exclusivesGrid">
          <v-col v-for="product in products" :key="product.id" cols="12" sm="6" md="3">
            <productCard :product="product" />
          </v-col>
        </v-row>
        <v-sheet v-else-if="products.length" class="mx-auto sliderProducts row align-items-stretch items-row justify-content-center">
          <v-slide-group class="pa-4" show-arrows>
            <v-slide-group-item v-for="product in products" :key="product.id">
              <productCard :product="product" class="ma-4" />
            </v-slide-group-item>
          </v-slide-group>
        </v-sheet>

        <template v-if="content.length">
          <h3 class="exclusivesSubtitle mbr-fonts-style display-7">From Sebastian Hilton and Meeovi</h3>
          <v-slide-group class="pa-4" show-arrows>
            <v-slide-group-item v-for="item in content" :key="`${item.kind}-${item.row.id}`">
              <postCard v-if="item.kind === 'post'" :post="item.row" class="ma-4 exclusivesNote" />
              <shortsCard v-else :short="item.row" class="ma-4" />
            </v-slide-group-item>
          </v-slide-group>
        </template>
      </div>
    </section>
  </div>
</template>

<script setup>
  import { computed } from 'vue'
  import { reuseServerData } from '#shared/app/utils/reuseServerData'
  import productCard from './productCard.vue'
  import postCard from '#social/app/components/related/post.vue'
  import shortsCard from '#social/app/components/related/short.vue'

  defineProps({
    // The Exclusives department page: products as a grid, no heading.
    page: { type: Boolean, default: false },
  })

  const { data } = useAsyncData('home-exclusives', () => $fetch('/api/commerce/home/exclusives'),
    { getCachedData: reuseServerData, lazy: true, default: () => null })

  const products = computed(() => data.value?.products ?? [])
  // Notes and vibes together, newest first.
  const content = computed(() => [
    ...(data.value?.posts ?? []).map((row) => ({ kind: 'post', row })),
    ...(data.value?.shorts ?? []).map((row) => ({ kind: 'short', row })),
  ].sort((a, b) => String(b.row.date_created || '').localeCompare(String(a.row.date_created || ''))))
</script>

<style scoped>
.exclusivesSubtitle {
  margin: 16px 0 0;
}

.exclusivesNote {
  width: 320px;
}

.exclusivesGrid {
  padding: 10px;
}
</style>

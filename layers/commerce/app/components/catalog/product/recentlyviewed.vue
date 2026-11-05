<template>
  <!-- Signed-in members only: the products they opened most recently (kept
       with their account). Hidden for guests and until there's something. -->
  <div v-if="products.length">
    <section data-bs-version="5.1" class="mbr-section features20 cid-txNnCwzel4" id="features20-4t"
      data-sortbtn="btn-primary">
      <div class="container-fluid">
        <h2 class="mbr-section-title align-left mbr-fonts-style display-5">
          Recently Viewed</h2>
        <div class="underline align-left pb-3">
          <div class="line"></div>
        </div>
        <v-sheet class="mx-auto">
          <v-slide-group class="pa-4" show-arrows>
            <v-slide-group-item v-for="product in products" :key="product.id">
              <productCard :product="product" class="ma-4" />
            </v-slide-group-item>
          </v-slide-group>
        </v-sheet>
      </div>
    </section>
  </div>
</template>

<script setup>
  import { onMounted, ref } from 'vue'
  import { authClient } from '#auth/lib/auth-client'
  import productCard from './productCard.vue'

  // Personal, so never part of the server-rendered (and cached) page.
  const products = ref([])
  onMounted(async () => {
    const { data } = await authClient.getSession().catch(() => ({ data: null }))
    if (!data?.user) return
    const res = await $fetch('/api/commerce/recently-viewed').catch(() => null)
    products.value = res?.products ?? []
  })
</script>

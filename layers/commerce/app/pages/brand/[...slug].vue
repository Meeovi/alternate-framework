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
                <p class="mbr-text mbr-fonts-style mb-4 display-7">{{ brand.description }}</p>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <!--Brand Products-->
    <v-row style="padding: 10px;">
      <v-col cols="3" v-for="brand in brand?.shorts" :key="brand.id">
        <shorts :short="brand?.shorts_id" />
      </v-col>
    </v-row>

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
  import shorts from '#social/app/components/features/vibeSections/shorts.vue'
  import productCard from '@/components/catalog/product/productCard.vue'
  import relatedbrands from '@/components/catalog/product/relatedbrands.vue'
  import {
    useRuntimeConfig
  } from '#imports';

  const route = useRoute();
    const {
        $directus,
        $readItem,
        $readItems
    } = useNuxtApp()

    const slug = computed(() => {
        const s = route.params.slug
        return Array.isArray(s) ? s[0] : s
    })

    const {
        data: brandRaw
    } = await useAsyncData('brand', () => {
        return $directus.request(
            $readItems('brands', {
                fields: [
                    '*',
                    'products.products_id.*',
                    'products.products_id.image.*',
                    'shorts.shorts_id.*',
                    'image.*'
                ],
                filter: {
                    slug: {
                        _eq: slug.value
                    }
                },
                limit: 1
            })
        )
    })

    const brand = computed(() => brandRaw.value?.[0] || null)

  useHead({
    title: computed(() => brand.value?.name || 'Brand Page')
  })
</script>
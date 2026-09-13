<template>
  <div id="searchArea">
    <div class="searchHero">
      <h1>
        <span class="searchPreTitle">Meeovi</span><span class="searchAppendTitle">Search</span>
      </h1>
      <ClientOnly>
        <Search class="homeSearch" :placeholder="placeholder" />
      </ClientOnly>
    </div>

    <v-row>
      <v-col cols="12">
        <!-- Latest Products Section (commerce) -->
        <v-sheet style="background-color: transparent; box-shadow: none;">
          <v-toolbar color="transparent">
            <v-toolbar-title style="text-align: center;">Latest Products from the <NuxtLink to="https://www.meeovi.com">Meeovi Marketplace</NuxtLink></v-toolbar-title>
          </v-toolbar>
          <v-slide-group class="pa-4" selected-class="bg-success" show-arrows>
            <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }" v-for="product in latestProducts"
              :key="product.id">
              <productCard :product="product" :class="['ma-4', selectedClass]" @click="toggle" />
              <div class="d-flex fill-height align-center justify-center">
                <v-scale-transition>
                  <v-icon v-if="isSelected" color="white" icon="fas fa-circle-xmark" size="48"></v-icon>
                </v-scale-transition>
              </div>
            </v-slide-group-item>
          </v-slide-group>
        </v-sheet>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
  import Search from '#search/app/components/searchBar.vue'
  import productCard from '#commerce/app/components/catalog/product/productCard.vue'

  const placeholder = 'Search the Meeovi Marketplace'
  const {
    $directus,
    $readItems
  } = useNuxtApp()

  const {
    data: latestProducts
  } = await useAsyncData('latestProducts', async () => {
    if (usingBackendCatalog.value) return (backendCategoryProducts.value ?? []).slice(0, 10)
    const result = await $directus.request($readItems('departments', {
      fields: ['*',
        'products.products_id.*',
        'showcases.showcases_id.*',
        'images.*'
      ],
      limit: 10,
      filter: {
        products: {
          products_id: {
            status: {
              _eq: "published"
            }
          }
        }
      }
    }))
    return extractProducts(result)
  })

  useHead({
    title: 'Search Meeovi',
  })

  definePageMeta({
    layout: 'search',
  })
</script>

<style>
/******************** Search App CSS ******************/

#searchArea {
  width: 100%;
  max-width: 100%;
  padding: 0 13px;
}

/* Google-style centred hero: logo + search box, roughly a third down the page */
.searchHero {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 20vh;
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
  padding-top: 8vh;
}

.searchHero h1 {
  text-align: center;
  width: 100%;
  font-size: 3rem;
  margin-bottom: 1.75rem;
}

.searchPreTitle {
  color: red;
}

/* The search box: full width of the hero, centred. Kept as a plain block
   so the nested InstantSearch wrappers (.ais-InstantSearch / .ais-SearchBox
   / form.searchField) each fill the width instead of shrinking to content. */
.searchHero .homeSearch {
  position: relative;
  z-index: 3;
  display: block;
  box-sizing: border-box;
  width: 100%;
  min-height: 50px;
  margin: 0 auto;
  border-radius: 26px;
}

.searchHero .homeSearch .ais-InstantSearch,
.searchHero .homeSearch .ais-SearchBox {
  display: block;
  width: 100%;
}

.homeSearch .v-field__input {
  padding: 20px;
  border-radius: inherit;
}
</style>
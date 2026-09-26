<template>
  <div class="contentSection" v-if="result">
    <v-toolbar :title="shopBlock?.name" density="comfortable" color="transparent">
      <NuxtLink :to="shopBlock?.content?.[0]?.subject">
        {{ shopBlock?.content?.[0]?.name }}
      </NuxtLink>
    </v-toolbar>

    <v-sheet class="mx-auto">
      <v-slide-group v-model="model" class="py-4 px-sm-4" selected-class="bg-success">
        <v-slide-group-item v-for="(product, index) in result" :key="product.id || index"
          v-slot="{ toggle, selectedClass }">
          <!-- ONE SINGLE ROOT WRAPPER — REQUIRED -->
          <div class="slide-item" @click="toggle">
            <productCard :product="product" :class="selectedClass" />

            <v-scale-transition>
              <!-- Example icon overlay if needed
                   (but always INSIDE the single root)
              -->
              <div class="overlay d-flex align-center justify-center">
                <v-icon icon="fas fa-x" size="48" color="white" />
              </div>
            </v-scale-transition>
          </div>
        </v-slide-group-item>
      </v-slide-group>
    </v-sheet>
  </div>
</template>

<script setup>
  import productCard from '~/components/related/productCard.vue'
  import {
    ref
  } from 'vue'
  import {
    createDirectus,
    rest,
    readItems
  } from '@directus/sdk'

  const config = useRuntimeConfig()
  const client = createDirectus(config.public.meeDirectusUrl).with(rest())

  const {
    data: result
  } = useLazyAsyncData('result', () => {
    return client.request(
      readItems('products', {
        filter: {
          departments: {
            departments_id: {
              name: {
                _eq: 'Elite Novels'
              }
            }
          }
        }
      })
    )
  })

  const model = ref(null)

  const {
    $directus,
    $readItem
  } = useNuxtApp()

  const {
    data: shopBlock
  } = useLazyAsyncData('shopBlock', () => {
    return $directus.request(
      $readItem('blocks', '7', {
        fields: ['*', {
          '*': ['*']
        }]
      })
    )
  })
</script>

<style scoped>
  .slide-item {
    position: relative;
    cursor: pointer;
  }

  .overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
</style>
<template>
  <div>
    <div class="border border-neutral-200 rounded-md hover:shadow-lg max-w-[300px]">
      <div class="relative" v-if="displayProduct?.image?.length > 0">
        <NuxtLink :to="`/product/${displayProduct?.id}`" class="block">
          <img v-if="$directus && displayProduct?.image?.filename_disk"
            :src="`${$directus.url}assets/${displayProduct?.image?.filename_disk}`" :alt="displayProduct?.name"
            class="block object-cover h-auto rounded-md aspect-square" width="300" height="300" />
          <img v-else-if="displayProduct?.imageUrl" :src="displayProduct?.imageUrl" :alt="displayProduct?.name"
            class="block object-cover h-auto rounded-md aspect-square" width="300" height="300" />
        </NuxtLink>
        <v-btn variant="flat" size="sm" square
          class="absolute bottom-0 right-0 mr-2 mb-2 bg-white ring-1 ring-inset ring-neutral-200 rounded-full!"
          aria-label="Add to wishlist">
          <v-icon icon="fas fa-heart" size="sm"></v-icon>
        </v-btn>
      </div>

      <div class="relative" v-else>
        <NuxtLink :to="`/product/${displayProduct?.id}`" class="block">
          <img src="~/assets/images/mbr-1920x1893.png" :alt="displayProduct?.name"
            class="block object-cover h-auto rounded-md aspect-square" width="300" height="300" />
        </NuxtLink>
        <v-btn variant="flat" size="sm" square
          class="absolute bottom-0 right-0 mr-2 mb-2 bg-white ring-1 ring-inset ring-neutral-200 rounded-full!"
          aria-label="Add to wishlist">
          <v-icon icon="fas fa-heart" size="sm"></v-icon>
        </v-btn>
      </div>
      <div class="p-4 border-t border-neutral-200" style="background-color: white !important;">
        <NuxtLink :to="`/product/${displayProduct?.id}`" variant="secondary" class="no-underline"> {{ displayProduct?.name }}
        </NuxtLink>
        <div class="flex items-center pt-1">
          <v-rating size="xs" active-color="warning" :model-value="displayProduct?.rating" :max="5" />

          <NuxtLink :to="`/product/${displayProduct?.id}`" variant="secondary" class="pl-1 no-underline">
            <v-chip size="xs">{{ displayProduct?.rating }}</v-chip>
          </NuxtLink>
        </div>
        <p class="block py-2 font-normal leading-5 typography-text-sm text-neutral-700"
          v-if="displayProduct?.brands && displayProduct?.brands.length > 0">
          By:
        <div style="display: inline-block;" v-for="brands in product?.brands" :key="brands">
          <NuxtLink :to="`/brand/${brands?.brands_id?.slug}`">{{ brands?.brands_id?.name }}</NuxtLink></div>
        </p>
        <span class="block pb-2 font-bold typography-text-lg">
          <div style="display: inline-block;" v-for="currency in displayProduct?.currency || []" :key="currency">
            {{ currency?.currency_id?.symbol }}
          </div>
          {{ displayProduct?.price }}
        </span>
        <!--<v-btn size="sm">
          <template #prefix>
            <SfIconShoppingCart size="sm" />
          </template>
          Add to cart
        </v-btn>-->
      </div>
    </div>
  </div>
</template>

<script setup>
    import { ref, onMounted, watch, computed } from 'vue'
    import { useCatalogFallback } from '../../../composables/useCatalog'

    const props = defineProps({
      product: {
        type: [Object, String],
        required: true,
      },
    });

    const productData = ref<any>(null)
    const catalog = useCatalogFallback()

    const displayProduct = computed(() => productData.value || props.product)

    const resolveId = (p: any) => {
      if (!p) return null
      if (typeof p === 'string') return p
      // directus nested shape product?.products_id or products_id?.id
      return p.id || p.products_id?.id || p.products_id || null
    }

    async function load() {
      const id = resolveId(props.product)
      if (!id) return
      // prefer adapter if available
      if (catalog.adapter) {
        // adapter may expose getProductById or getProductBySlug
        try {
          const p = await catalog.getProductById(id)
          productData.value = p || (await catalog.getProductBySlug(id))
        } catch (e) {
          productData.value = await catalog.getProductBySlug(id)
        }
      } else {
        productData.value = await catalog.getProductById(id)
      }
    }

    onMounted(load)
    watch(() => props.product, load)
</script>
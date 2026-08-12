<template>
  <v-table class="product-compare-table">
    <thead>
      <tr>
        <th class="text-left">Product</th>
        <th class="text-left" v-for="product in products" :key="`header-${product?.id}`">
          <v-card class="mx-auto" max-width="280" elevation="0">
            <v-img class="align-end text-white" height="160"
              :src="getAssetURL(product?.image) || 'https://cdn.vuetifyjs.com/images/cards/docks.jpg'" cover>
            </v-img>
            <v-card-title>{{ product?.name }}</v-card-title>
          </v-card>
        </th>
      </tr>
    </thead>

    <tbody>
      <tr>
        <th class="text-left">Price</th>
        <td v-for="product in products" :key="`price-${product?.id}`">
          {{ getPricing(product)?.formatted?.final || product?.price }}
        </td>
      </tr>

      <tr>
        <th class="text-left">Rating</th>
        <td v-for="product in products" :key="`rating-${product?.id}`">
          <ratings :rating="product?.rating" />
        </td>
      </tr>

      <tr>
        <th class="text-left">SKU</th>
        <td v-for="product in products" :key="`sku-${product?.id}`">{{ product?.sku }}</td>
      </tr>

      <tr>
        <th class="text-left">Category</th>
        <td v-for="product in products" :key="`category-${product?.id}`">
          {{ (product?.categories || []).map((c) => c?.categories_id?.name).filter(Boolean).join(', ') }}
        </td>
      </tr>

      <tr>
        <th class="text-left">Manufacturer</th>
        <td v-for="product in products" :key="`manufacturer-${product?.id}`">
          {{ product?.manufacturer?.manufacturer_id?.name }}
        </td>
      </tr>

      <tr>
        <th class="text-left">In Stock</th>
        <td v-for="product in products" :key="`stock-${product?.id}`">{{ product?.stock }}</td>
      </tr>

      <tr>
        <th class="text-left">Variant</th>
        <td v-for="product in products" :key="`size-${product?.id}`">
          <sizeOptions :size="product?.id" />
        </td>
      </tr>

      <tr>
        <th class="text-left">Color</th>
        <td v-for="product in products" :key="`color-${product?.id}`">
          <colorOptions :color="product?.id" />
        </td>
      </tr>

      <tr>
        <th class="text-left">Actions</th>
        <td v-for="product in products" :key="`actions-${product?.id}`">
          <addToCartBtn :product="product" :quantity="1" />
          <v-btn color="orange" variant="text" text="Take A Look" :href="`/product/${product?.slug || product?.id}`"></v-btn>
        </td>
      </tr>
    </tbody>
  </v-table>
</template>

<script setup>
  import ratings from '../../blocks/ratings.vue'
  import colorOptions from './colorOptions.vue'
  import sizeOptions from './sizeOptions.vue'
  import addToCartBtn from '../../blocks/addToCartBtn.vue'
  import { getAssetURL } from '#shared/app/utils/get-asset-url'
  import { usePrice } from '../../../composables/catalog/price/price'

  const props = defineProps({
    products: {
      type: Array,
      required: true,
      default: () => []
    },
  });

  const { getProductPrice } = usePrice()

  const getPricing = (product) => getProductPrice(product || {})
</script>

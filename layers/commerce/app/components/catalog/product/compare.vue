<template>
  <v-table class="product-compare-table">
    <thead>
      <tr>
        <th class="text-left">Product</th>
        <th class="text-left" v-for="product in products" :key="`header-${product?.id}`">
          <v-card class="mx-auto" max-width="280" elevation="0">
            <v-img class="align-end text-white" height="160"
              :src="getImageURL(product?.image)" cover>
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
          <MeeoviRating type="product" :id="canonicalProductKey(product)" readonly size="x-small" />
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

      <!-- Manufacturer, stock, variant and colour don't apply to digital
           products: hidden when every product here is digital, a dash for
           the digital ones in a mixed comparison. -->
      <template v-if="hasPhysical">
        <tr>
          <th class="text-left">Manufacturer</th>
          <td v-for="product in products" :key="`manufacturer-${product?.id}`">
            <template v-if="isDigital(product)">—</template>
            <template v-else>{{ product?.manufacturer?.manufacturer_id?.name }}</template>
          </td>
        </tr>

        <tr>
          <th class="text-left">In Stock</th>
          <td v-for="product in products" :key="`stock-${product?.id}`">
            {{ isDigital(product) ? '—' : product?.stock }}
          </td>
        </tr>

        <tr>
          <th class="text-left">Variant</th>
          <td v-for="product in products" :key="`size-${product?.id}`">
            <template v-if="isDigital(product)">—</template>
            <sizeOptions v-else :size="product?.id" />
          </td>
        </tr>

        <tr>
          <th class="text-left">Color</th>
          <td v-for="product in products" :key="`color-${product?.id}`">
            <template v-if="isDigital(product)">—</template>
            <colorOptions v-else :color="product?.id" />
          </td>
        </tr>
      </template>

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
  import colorOptions from './colorOptions.vue'
  import sizeOptions from './sizeOptions.vue'
  import addToCartBtn from '../../blocks/addToCartBtn.vue'
  import { getImageURL } from '#shared/app/utils/get-asset-url'
  import { usePrice } from '../../../composables/catalog/price/price'
  import { canonicalProductKey } from '../../../utils/productKey'

  const props = defineProps({
    products: {
      type: Array,
      required: true,
      default: () => []
    },
  });

  const { getProductPrice } = usePrice()

  const getPricing = (product) => getProductPrice(product || {})

  // Digital: a downloadable file (a store product's download_url, or a
  // Directus file) or the "Digital" product type.
  const isDigital = (product) => Boolean(
    product?.download_url
    || product?.file
    || product?.product_types?.product_types_id?.name === 'Digital'
  )
  const hasPhysical = computed(() => props.products.some((product) => !isDigital(product)))
</script>

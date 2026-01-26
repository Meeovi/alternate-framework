<template>
  <v-table>
    <tbody>
      <tr>
        <th>Released</th>
        <td>{{ new Date(product?.created_at).toLocaleDateString() }}</td>
      </tr>
      <tr>
        <th>Updated</th>
        <td>{{ new Date(product?.updated_at).toLocaleDateString() }}</td>
      </tr>
      <tr>
        <th>Name</th>
        <td>{{ product?.name }}</td>
      </tr>
      <tr>
        <th>Category Name</th>
        <td><div style="display: inline-block;" v-for="categories in product?.categories" :key="categories">{{ categories?.categories_id?.name.join(', ') }}</div></td>
      </tr>
      <tr>
        <th>Price</th>
        <td>
          <strong><div style="display: inline-block;" v-for="currency in product?.currency" :key="currency">{{ currency?.currency_id?.symbol }}</div></strong>
          {{ product?.price }}
        </td>
      </tr>
      <tr>
        <th>Average Rating</th>
        <td><ratings :rating="product?.rating" /></td>
      </tr>
      <tr>
        <th># of Reviews</th>
        <td>{{ product?.review_count }}</td>
      </tr>
      <tr>
        <th>Sku</th>
        <td>{{ product?.sku }}</td>
      </tr>
      <tr>
        <th>How many items are left?</th>
        <td>{{ product?.stock }}</td>
      </tr>
      <tr>
        <th>Visibility</th>
        <td>{{ product?.visibility }}</td>
      </tr>
      <tr>
        <th>Weight</th>
        <td>{{ product?.weight }}</td>
      </tr>
      <tr>
        <th>Height</th>
        <td>{{ product?.height }}</td>
      </tr>
      <tr>
        <th>Format</th>
        <td v-dompurify-html="product?.format"></td>
      </tr>
      <tr>
        <th>Product Color</th>
        <td>{{ product?.color }}</td>
      </tr>
      <tr>
        <th>Product Size</th>
        <td>{{ product?.size }}</td>
      </tr>
      <tr>
        <th>Product Manufacturer</th>
        <td>{{ product?.manufacturer?.manufacturer_id?.name }}</td>
      </tr>
      <tr>
        <th>Product Description</th>
        <td><div v-dompurify-html="product?.content"></div></td>
      </tr>
      <tr>
        <th>Is Gift Message Available</th>
        <td>{{ product?.gift_message_available }}</td>
      </tr>
      <tr>
        <th>Special to Date</th>
        <td><div style="display: inline-block;" v-for="currency in product?.currency" :key="currency">{{ currency?.currency_id?.symbol }}</div> {{ product?.special_to_date }}</td>
      </tr>
      <tr>
        <th>Special Price</th>
        <td><div style="display: inline-block;" v-for="currency in product?.currency" :key="currency">{{ currency?.currency_id?.symbol }}</div> {{ product?.special_price  }}</td>
      </tr>
      <tr>
        <th>Is Featured</th>
        <td>{{ product?.is_featured }}</td>
      </tr>
      <tr>
        <th>Product URL Key</th>
        <td>{{ product?.url_key }}</td>
      </tr>
      <tr>
        <th>Product URL Path</th>
        <td>{{ product?.url_path }}</td>
      </tr>
      <tr>
        <th>Product Gift Message Availability</th>
        <td>{{ product?.gift_message_available }}</td>
      </tr>
    </tbody>
  </v-table>
</template>

<script setup>
import ratings from '../../partials/ratings.vue'

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
});
</script>
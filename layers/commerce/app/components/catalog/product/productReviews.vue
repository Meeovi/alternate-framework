<script setup lang="ts">
import { useVendureQuery } from "../../../composables/useVendureQuery";
import getProductReviewsQuery from "#graphql/app/commerce/queries/getProductReviews.gql";

const props = defineProps<{ productId: string }>();
const { data } = useVendureQuery(getProductReviewsQuery, {
  productId: props.productId,
});
const reviews = computed(() => data.value?.product?.reviews || []);

const format: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  hour12: true,
};
const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-us", format);
</script>

<template>
  <div>
    <h4 class="text-xl font-bold dark:text-white mt-3">
      {{ $t("product.reviews") }}
    </h4>
    <div v-if="reviews.length">
      <div v-for="review in reviews" :key="review.id">
        <div
          v-if="review.createdAt"
          class="mt-3 text-gray-600 text-sm"
        >
          <span>{{ formatDate(review.createdAt) }}</span>
        </div>
        <div class="inline-flex items-center mt-2">
          <span
            v-for="n in review.rating"
            :key="n"
            class="w-5 h-5 i-carbon-star-filled"
          ></span>
          <span
            v-for="n in 5 - review.rating"
            :key="n"
            class="w-5 h-5 i-carbon-star"
          ></span>
          <span class="font-semibold ml-2">{{ review.summary }}</span>
        </div>
        <div class="mt-2">
          <p class="wrap-break-word">{{ review.body }}</p>
        </div>
      </div>
    </div>
    <div v-else>{{ $t("product.noReviews") }}</div>
  </div>
</template>

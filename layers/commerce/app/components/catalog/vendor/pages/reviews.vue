<template>
    <v-card>
        <v-toolbar color="" title="Product Reviews"></v-toolbar>
        <template #header>
            <div v-if="reviews.length">
                <div v-for="review in reviews" :key="review.id">
                    <p><strong>{{ review.author?.firstName }} {{ review.author?.lastName }}</strong> ({{ new Date(review.createdAt).toLocaleDateString() }})</p>
                    <p>Rating: {{ review.rating }}</p>
                    <p>{{ review.summary }}</p>
                    <p>{{ review.body }}</p>
                </div>
            </div>
            <div v-else>No reviews found.</div>
        </template>
    </v-card>
</template>



<script setup>

    import {
        ref,
        onMounted
    } from '#imports'
    import {
        useCommerceQuery
    } from '~/composables/globals/useCommerceQuery';
    import getProductReviewsQuery from '#graphql/app/commerce/queries/getProductReviews.gql';

    const reviews = ref([]);
    const {
        data,
        refetch
    } = useCommerceQuery(getProductReviewsQuery);

    onMounted(() => {
        if (data.value?.product?.reviews?.items) {
            reviews.value = data.value.product.reviews.items;
        }
    });

    definePageMeta({
      layout: "sellers",
      middleware: ['authenticated'],
    });

    useHead({
        title: 'Sellers Stores'
    })
</script>
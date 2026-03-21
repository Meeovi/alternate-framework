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


import { useCommerceAdapter, useContentAdapter } from '#imports'
void useCommerceAdapter()
void useContentAdapter()

    import {
        ref,
        onMounted
    } from '#imports'
    import {
        useVendureQuery
    } from '@/app/composables/useVendureQuery';
    import getProductReviewsQuery from '#graphql/app/commerce/queries/getProductReviews.gql';

    const reviews = ref([]);
    const {
        data,
        refetch
    } = useVendureQuery(getProductReviewsQuery);

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
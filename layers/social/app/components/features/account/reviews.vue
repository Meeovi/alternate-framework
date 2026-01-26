<template>
    <div>
        <!---->
        <v-toolbar color="transparent" density="compact" title="My Reviews">
            <v-spacer />
            <v-text-field
                v-model="search"
                append-icon="fas:fa fa-search"
                label="Search Reviews"
                single-line
                hide-details
                density="compact"
                class="search-field"
            />
        </v-toolbar>

        <v-card>
            <v-tabs v-model="tab" bg-color="transparent">
                <v-tab value="written">Reviews Written</v-tab>
                <v-tab value="pending">Pending Reviews</v-tab>
            </v-tabs>

            <v-card-text>
                <v-tabs-window v-model="tab">
                    <v-tabs-window-item value="written">
                        <v-table>
                            <thead>
                                <tr>
                                    <th class="text-left">Product</th>
                                    <th class="text-left">Rating</th>
                                    <th class="text-left">Review</th>
                                    <th class="text-left">Date</th>
                                    <th class="text-left">Status</th>
                                    <th class="text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="review in filteredReviews" :key="review.id">
                                    <td>
                                        <div class="d-flex align-center">
                                            <v-img
                                                :src="review.product_image"
                                                width="50"
                                                height="50"
                                                class="mr-2"
                                            />
                                            {{ review.product_name }}
                                        </div>
                                    </td>
                                    <td>
                                        <v-rating
                                            :model-value="review.rating"
                                            readonly
                                            density="compact"
                                        />
                                    </td>
                                    <td>{{ review.title }}</td>
                                    <td>{{ formatDate(review.created_at) }}</td>
                                    <td>
                                        <v-chip
                                            :color="review.status === 'approved' ? 'success' : 'warning'"
                                            size="small"
                                        >
                                            {{ review.status }}
                                        </v-chip>
                                    </td>
                                    <td>
                                        <v-btn
                                            icon="fas:fa fa-edit"
                                            color="primary"
                                            size="small"
                                            @click="editReview(review)"
                                        />
                                        <v-btn
                                            icon="fas:fa fa-trash"
                                            color="error"
                                            size="small"
                                            @click="deleteReview(review.id)"
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </v-table>
                    </v-tabs-window-item>

                    <v-tabs-window-item value="pending">
                        <v-table>
                            <thead>
                                <tr>
                                    <th class="text-left">Product</th>
                                    <th class="text-left">Order Date</th>
                                    <th class="text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="order in pendingReviews" :key="order.id">
                                    <td>
                                        <div class="d-flex align-center">
                                            <v-img
                                                :src="order.product_image"
                                                width="50"
                                                height="50"
                                                class="mr-2"
                                            />
                                            {{ order.product_name }}
                                        </div>
                                    </td>
                                    <td>{{ formatDate(order.created_at) }}</td>
                                    <td>
                                        <v-btn
                                            color="primary"
                                            size="small"
                                            @click="writeReview(order)"
                                        >
                                            Write Review
                                        </v-btn>
                                    </td>
                                </tr>
                            </tbody>
                        </v-table>
                    </v-tabs-window-item>
                </v-tabs-window>
            </v-card-text>

            <v-pagination
                v-model="page"
                :length="totalPages"
                @update:model-value="loadReviews"
            />
        </v-card>

        <!-- Review Dialog -->
        <v-dialog v-model="showReviewDialog" max-width="600px">
            <v-card>
                <v-card-title>
                    {{ editingReview ? 'Edit Review' : 'Write Review' }}
                </v-card-title>
                <v-card-text>
                    <v-form ref="reviewForm" v-model="reviewValid">
                        <DirectusFormElement 
                            v-for="field in reviewFields" 
                            :key="field.field" 
                            :field="field"
                            v-model="reviewForm[field.field]"
                        />
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn color="error" @click="showReviewDialog = false">Cancel</v-btn>
                    <v-btn
                        color="primary"
                        @click="saveReview"
                        :loading="saving"
                        :disabled="!reviewValid"
                    >
                        Save Review
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup>
    import {
        ref,
        computed,
        onMounted
    } from 'vue'

    const { $directus, $readFieldsByCollection, $createItem, $updateItem, $deleteItem } = useNuxtApp()

    const reviews = ref([])
    const pendingReviews = ref([])
    const search = ref('')
    const page = ref(1)
    const totalPages = ref(1)
    const showReviewDialog = ref(false)
    const reviewValid = ref(false)
    const saving = ref(false)
    const editingReview = ref(null)
    const reviewFields = ref([])

    const reviewForm = ref({
        rating: 0,
        title: '',
        detail: '',
        product_id: null
    })

    const filteredReviews = computed(() => {
        if (!search.value) return reviews.value
        const searchLower = search.value.toLowerCase()
        return reviews.value.filter(review => 
            review.product_name.toLowerCase().includes(searchLower) ||
            review.title.toLowerCase().includes(searchLower)
        )
    })

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString()
    }

    const loadReviewFields = async () => {
        try {
            const fields = await $directus.request($readFieldsByCollection('reviews'))
            reviewFields.value = fields.filter(field => 
                ['rating', 'title', 'detail'].includes(field.field)
            )
        } catch (error) {
            console.error('Failed to load review fields:', error)
        }
    }

    const loadReviews = async () => {
        try {
            const response = await $directus.request($readItems('reviews', {
                params: {
                    page: page.value,
                    limit: 10,
                    filter: {
                        status: { _neq: 'pending' }
                    }
                }
            }))
            reviews.value = response.data
            totalPages.value = Math.ceil(response.meta.total_count / 10)
        } catch (error) {
            console.error('Failed to load reviews:', error)
        }
    }

    const loadPendingReviews = async () => {
        try {
            const response = await $directus.request($readItems('reviews', {
                params: {
                    filter: {
                        status: 'pending'
                    }
                }
            }))
            pendingReviews.value = response.data
        } catch (error) {
            console.error('Failed to load pending reviews:', error)
        }
    }

    const editReview = (review) => {
        editingReview.value = review
        reviewForm.value = {
            rating: review.rating,
            title: review.title,
            detail: review.detail,
            product_id: review.product_id
        }
        showReviewDialog.value = true
    }

    const writeReview = (order) => {
        editingReview.value = null
        reviewForm.value = {
            rating: 0,
            title: '',
            detail: '',
            product_id: order.product_id
        }
        showReviewDialog.value = true
    }

    const saveReview = async () => {
        try {
            saving.value = true
            if (editingReview.value) {
                await $directus.request($updateItem('reviews', editingReview.value.id, reviewForm.value))
            } else {
                await $directus.request($createItem('reviews', {
                    ...reviewForm.value,
                    status: 'pending'
                }))
            }
            showReviewDialog.value = false
            await loadReviews()
            await loadPendingReviews()
        } catch (error) {
            console.error('Failed to save review:', error)
        } finally {
            saving.value = false
        }
    }

    const deleteReview = async (reviewId) => {
        if (!confirm('Are you sure you want to delete this review?')) return
        
        try {
            await $directus.request($deleteItem('reviews', reviewId))
            await loadReviews()
        } catch (error) {
            console.error('Failed to delete review:', error)
        }
    }

    const tab = ref(null)

    onMounted(() => {
        loadReviewFields()
        loadReviews()
        loadPendingReviews()
    })

    useHead({
        title: 'My Reviews'
    })
</script>

<style scoped>
.search-field {
    max-width: 300px;
}
</style>
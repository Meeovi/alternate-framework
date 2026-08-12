<template>
    <div class="contentPage">
        <section data-bs-version="5.1" class="clients1 cid-uHg1k6KLf8" id="clients1-ap" style="height: 100% !important;">
            <div class="container">
                <div class="row justify-content-center">
                    <div class="col-12" style="bottom: 25px; position: relative; color: black;">
                        <h1 style="text-align: center;">Track your order</h1>
                        <p style="text-align: center;">Sign in and enter your order number to see its shipping status.</p>
                    </div>

                    <div class="col-12 col-md-6 col-lg-4">
                        <form class="trackingForm" @submit.prevent="lookup">
                            <label>Order number
                                <input v-model="orderId" required />
                            </label>
                            <button type="submit" :disabled="loading">
                                {{ loading ? 'Looking up…' : 'Track order' }}
                            </button>
                        </form>

                        <p v-if="error" class="trackingError">{{ error }}</p>

                        <div v-if="result" class="trackingResult">
                            <h3>Order {{ result.orderId }}</h3>
                            <p><strong>Status:</strong> {{ result.status || result.fulfillmentStatus || 'Processing' }}</p>
                            <p v-if="result.statusDetails">{{ result.statusDetails }}</p>
                            <p v-if="result.carrier && result.trackingNumber">
                                {{ result.carrier }} — {{ result.trackingNumber }}
                            </p>
                            <p v-if="result.eta">Estimated delivery: {{ result.eta }}</p>
                            <a v-if="result.trackingUrl" :href="result.trackingUrl" target="_blank" rel="noopener">
                                View on carrier site
                            </a>

                            <ul v-if="result.history?.length" class="trackingHistory">
                                <li v-for="(event, index) in result.history" :key="index">
                                    <strong>{{ event.status }}</strong> — {{ event.status_details }}
                                    <span v-if="event.status_date">({{ new Date(event.status_date).toLocaleString() }})</span>
                                </li>
                            </ul>
                            <p v-else-if="!result.trackingNumber">
                                This order hasn't shipped yet — check back once it's on its way.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
    import { ref } from 'vue'

    useHead({
        title: 'Track your Order',
    })

    const orderId = ref('')
    const loading = ref(false)
    const error = ref('')
    const result = ref(null)

    const lookup = async () => {
        loading.value = true
        error.value = ''
        result.value = null
        try {
            result.value = await $fetch('/api/shipment/order-tracking', {
                query: { orderId: orderId.value }
            })
        } catch (err) {
            if (err?.statusCode === 401 || err?.response?.status === 401) {
                error.value = 'Please sign in to track your order.'
            } else {
                error.value = err?.data?.statusMessage || 'Could not find that order.'
            }
        } finally {
            loading.value = false
        }
    }
</script>

<style scoped>
    .trackingForm {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .trackingForm label {
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-size: 14px;
    }

    .trackingForm input {
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
    }

    .trackingForm button {
        padding: 12px;
        border-radius: 4px;
        border: 0;
        background: #5469d4;
        color: #fff;
        font-weight: 600;
        cursor: pointer;
    }

    .trackingError {
        color: #df1b41;
        margin-top: 12px;
    }

    .trackingResult {
        margin-top: 20px;
        padding: 16px;
        border: 1px solid #eee;
        border-radius: 4px;
    }

    .trackingHistory {
        margin-top: 12px;
        padding-left: 18px;
    }

    .trackingHistory li {
        margin-bottom: 8px;
        font-size: 14px;
    }
</style>

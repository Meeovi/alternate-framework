<template>
    <div>
        <section data-bs-version="5.1" class="firmm4_features1 features1 cid-uhBuptnWmV" id="features1-9v"
            data-sortbtn="btn-primary">
            <div class="container-fluid">
                <div class="row">
                    <div class="col-12 title_block">
                        <h3 class="mbr-section-title mbr-fonts-style align-center mb-0 display-2">
                            <strong>Transaction: {{ transaction?.id }}</strong></h3>
                    </div>
                </div>
                <div class="row justify-content-center">
                    <div class="card col-12">
                        <div class="card_wrapper">
                            <div class="card-box">
                                <div class="icon_block">
                                    <div class="iconfont-wrapper">
                                        <span class="mbr-iconfont mobi-mbri-cart-full mobi-mbri"></span>
                                    </div>
                                </div>
                                <p class="card-text mbr-fonts-style display-4">Order: {{ transaction?.order }}</p>
                                <p class="card-text mbr-fonts-style display-4">Date: {{ transaction?.date_created ? new Date(transaction.date_created).toLocaleDateString() : '' }}</p>
                                <p class="card-text mbr-fonts-style display-4">Type: {{ transaction?.type }}</p>
                                <p class="card-text mbr-fonts-style display-4">Payment Method: {{ transaction?.payment_method }}</p>
                                <p class="card-text mbr-fonts-style display-4">Amount: {{ transaction?.amount }}</p>
                                <p class="card-text mbr-fonts-style display-4">Status: {{ transaction?.status }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
    const props = defineProps({
        transaction: {
            type: Object,
            required: true,
        },
    });
</script>

<template>
    <div>
        <!--<profilebar />-->
        <section data-bs-version="5.1" class="firmm4_features1 features1 cid-uhBuptnWmV" id="features1-9v"
            data-sortbtn="btn-primary">
            <div class="container-fluid">
                <div class="row">
                    <div class="col-12 title_block">
                        <h3 class="mbr-section-title mbr-fonts-style align-center mb-0 display-2">
                            <strong>Invoice: {{ invoice?.id }}</strong></h3>
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
                                <p class="card-text mbr-fonts-style display-4">Invoice: {{ invoice?.id }}</p>
                                <p class="card-text mbr-fonts-style display-4">Invoice Date: {{ new Date(invoice?.created_at).toLocaleDateString() }}</p>
                                <p class="card-text mbr-fonts-style display-4">Bill to Name: {{ invoice?.user?.first_name }} {{ invoice?.user?.last_name }}</p>
                                <p class="card-text mbr-fonts-style display-4">Status: {{ invoice?.state }}</p>
                                <p class="btn_link mbr-fonts-style display-4"><NuxtLink :to="`/invoice/${invoice?.id}`" class="text-secondary">View<span class="mobi-mbri mobi-mbri-right mbr-iconfont"></span></NuxtLink></p>
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
    invoice: {
      type: Object,
      required: true,
    },
  });
</script>
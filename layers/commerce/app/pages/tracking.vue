<template>
    <div class="contentPage">
        <!-- The AfterShip target container -->
        <section data-bs-version="5.1" class="clients1 cid-uHg1k6KLf8" id="clients1-ap" style="height: 100% !important;">
            <div class="container">
                <div class="row justify-content-center">
                    <div class="col-12" style="bottom: 25px; position: relative; color: black;">
                        <h1 style="text-align: center;">Track your order</h1>

                        <p style="text-align: center;">The below tool will redirect you to After Ship to track your
                            order. Meeovi is not responsible for data found on their website.</p>
                    </div>
                    <div class="col-12 col-md-6 col-lg-4">
                        <div class="as-track-button" data-domain="track.aftership.com" data-size="large"></div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
    useHead({
        title: 'Track your Order',
        script: [{
            id: 'aftership-jssdk',
            src: 'https://button.aftership.com/all.js',
            async: true,
            defer: true
        }]
    })

    onMounted(() => {
        const initAfterShip = () => {
            if (window.aftership?.buttonCreator?.create) {
                window.aftership.buttonCreator.create()
            }
        }
        initAfterShip()
        // Retry after a short delay in case the SDK initializes asynchronously
        setTimeout(initAfterShip, 500)
    })
</script>
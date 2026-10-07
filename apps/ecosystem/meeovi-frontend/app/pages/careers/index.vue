<template>
    <div>
<section data-bs-version="5.1" class="header19 cid-vxhSom1JLe mbr-fullscreen mbr-parallax-background" id="header19-br">

    

    
    <div class="mbr-overlay" style="opacity: 0.5; background-color: rgb(35, 35, 35);">
    </div>

    <div class="container">
        <div class="media-container">
            <div class="col-md-12 align-center">
                <h1 class="mbr-section-title mbr-white mbr-bold mbr-fonts-style mb-3 display-1">
                    Careers</h1>
                <p class="mbr-text mbr-white mbr-fonts-style display-7">
                    Full screen intro with background image, color overlay and icons
                </p>
                

                <div class="row justify-content-center">
                    <div class="item features-without-image col-12 col-md-3">
                        <div class="item-wrapper">
                            <div class="card-box align-center">
                                <span class="mbr-iconfont mobi-mbri-code mobi-mbri"></span>
                                <h4 class="card-title align-center mbr-black mbr-fonts-style display-7">
                                    <strong>Remote First</strong></h4>
                            </div>
                        </div>
                    </div>
                    <div class="item features-without-image col-12 col-md-3">
                        <div class="item-wrapper">
                            <div class="card-box align-center">
                                <span class="mbr-iconfont mobi-mbri-devices mobi-mbri"></span>
                                <h4 class="card-title align-center mbr-black mbr-fonts-style display-7">
                                    <strong>Flexible Schedules</strong></h4>
                            </div>
                        </div>
                    </div>
                    <div class="item features-without-image col-12 col-md-3">
                        <div class="item-wrapper">
                            <div class="card-box align-center">
                                <span class="mbr-iconfont mobi-mbri-website-theme-2 mobi-mbri"></span>
                                <h4 class="card-title align-center mbr-black mbr-fonts-style display-7">
                                    <strong>Room to grow</strong></h4>
                            </div>
                        </div>
                    </div>
                    <div class="item features-without-image col-12 col-md-3">
                        <div class="item-wrapper">
                            <div class="card-box align-center">
                                <span class="mbr-iconfont mobi-mbri-sites mobi-mbri"></span>
                                <h4 class="card-title align-center mbr-black mbr-fonts-style display-7">
                                    <strong>Career Focused</strong></h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<section data-bs-version="5.1" class="features3 cid-vxhSiZURn3" id="features3-bq">
    
    
    <div class="container">
        <div class="mbr-section-head">
            <h4 class="mbr-section-title mbr-fonts-style align-center mb-0 display-2">
                <strong>Available Jobs</strong></h4>
            
        </div>
        <div class="row mt-4">
            <div class="item features-image col-12 col-md-6 col-lg-4">
                <div class="item-wrapper">
                    <div class="item-img">
                        <img :src="career?.image" :alt="career?.title">
                    </div>
                    <div class="item-content">
                        <h5 class="item-title mbr-fonts-style display-7"><strong>{{ career?.title }}</strong></h5>
                        <h6 class="item-subtitle mbr-fonts-style mt-1 display-7">
                            <em>{{ career?.location }}</em>
                        </h6>
                        <p class="mbr-text mbr-fonts-style mt-3 display-7" v-dompurify-html="career?.description"></p>
                    </div>
                    <div class="mbr-section-btn item-footer mt-2"><NuxtLink :to="`/listing/${career.id}`" class="btn btn-primary item-btn display-7" target="_blank">View Details
                            &gt;</NuxtLink></div>
                </div>
            </div>
        </div>
    </div>
</section>
    </div>
</template>

<script setup>
  const {
    $directus,
    $readItems
  } = useNuxtApp()

  const {
    data: careersGrid
  } = useLazyAsyncData('careersGrid', () => {
    return $directus.request($readItems('careers'))
  })

const route = useRoute()

useHead({
    title: 'Careers at Meeovi',
})

  definePageMeta({
    layout: 'nolive',
    key: (route) => route.fullPath,
  })
</script>
<template>
    <div>
  <section data-bs-version="5.1" class="content6 cid-vxhTmiD5fq" id="content6-bs" data-sortbtn="btn-primary">
    
    <div class="container-fluid">
        <div class="row justify-content-center">
            <div class="col-md-12 col-lg-10">
                <hr class="line">
                <p class="mbr-text align-center mbr-fonts-style my-4 display-5">
                    <em>{{ listing?.title }}</em>
                </p>

                <p class="mbr-text align-center mbr-fonts-style my-4 display-5">
                    <em>Published: {{ listing?.date_created }}</em>
                </p>
                <hr class="line">
            </div>
        </div>
    </div>
</section>

<section data-bs-version="5.1" class="content7 cid-vxhTrfrwgm" id="content7-bt" data-sortbtn="btn-primary">
    
    <div class="container-fluid">
        <div class="row justify-content-center">
            <div class="col-12 col-md-10">
                <blockquote>
                <h5 class="mbr-section-title mbr-fonts-style mb-2 display-7"><strong>{{ listing?.location }}</strong></h5>
                <p class="mbr-text mbr-fonts-style display-4" v-dompurify-html="listing?.description"></p></blockquote>
            </div>
        </div>
    </div>
</section>

<section data-bs-version="5.1" class="content11 cid-vxhTsJvor6" id="content11-bu" data-sortbtn="btn-primary">
    
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-md-12 col-lg-10">
                <div class="mbr-section-btn align-center"><NuxtLink class="btn btn-primary display-4" to="">Apply Now</NuxtLink>
                    <NuxtLink class="btn btn-primary-outline display-4" to="/careers">Back to Careers</NuxtLink></div>
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

  const { data, status } = useLazyAsyncData(() => `listing-${route.params.slug}`, () => {
    return $directus.request($readItems('careers', {
      filter: {
        slug: {
          _eq: `${route.params.slug}`
        }
      },
      fields: [
        '*',
      ]
    }))
  })

  // Directus returns an array for readItems; normalize to a single listing
  const listing = computed(() => (Array.isArray(data.value) ? data.value[0] : data.value))
  const loading = computed(() => status.value === 'pending' && !listing.value)

const route = useRoute()

useHead({
    title: () => listing.value?.title || 'Listing',
})

  definePageMeta({
    layout: 'nolive',
    key: (route) => route.fullPath,
  })
</script>
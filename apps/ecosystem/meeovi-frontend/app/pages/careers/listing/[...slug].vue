<template>
    <div>
  <section data-bs-version="5.1" class="content6 cid-vxhTmiD5fq" id="content6-bs" data-sortbtn="btn-primary">
    
    <div class="container-fluid">
        <div class="row justify-content-center">
            <div class="col-md-12 col-lg-10">
                <hr class="line">
                <p class="mbr-text align-center mbr-fonts-style my-4 display-5">
                    <em>{{ listing?.name }}</em>
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
                <h5 class="mbr-section-title mbr-fonts-style mb-2 display-7"><strong>{{ listing?.type }}</strong></h5>
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

  const route = useRoute()

  // careers has no slug column — listings are addressed by id
  // (/careers/listing/<id>). The old slug filter made every visit a 500.
  const id = [].concat(route.params.slug || [])[0]

  const { data: listing, error } = await useAsyncData(`listing-${id}`, async () => {
    if (!/^\d+$/.test(String(id))) return null
    const rows = await $directus.request($readItems('careers', {
      filter: { id: { _eq: Number(id) }, status: { _eq: 'published' } },
      fields: ['id', 'name', 'description', 'type', 'url', 'image', 'degree_level', 'experience', 'date_created'],
      limit: 1,
    }))
    return (Array.isArray(rows) ? rows[0] : null) ?? null
  })

  if (error.value) {
    throw createError({ statusCode: 503, statusMessage: 'This page is temporarily unavailable', fatal: true })
  }
  if (!listing.value) {
    throw createError({ statusCode: 404, statusMessage: 'Job listing not found', fatal: true })
  }

useHead({
    title: () => listing.value?.name || 'Listing',
})

  definePageMeta({
    layout: 'nolive',
    key: (route) => route.fullPath,
  })
</script>
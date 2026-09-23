<template>
  <section data-bs-version="5.1" class="header19 cid-vvYicgPJ6g mbr-fullscreen mbr-parallax-background" id="header19-2p">
      <div class="mbr-overlay" style="opacity: 0.5; background-color: rgb(35, 35, 35);">
      </div>
  
      <div class="container">
          <div class="media-container">
              <div class="col-md-12 align-center">
                  <h1 class="mbr-section-title mbr-white mbr-bold mbr-fonts-style mb-3 display-1">
                      {{ title }}</h1>
                  <p class="mbr-text mbr-white mbr-fonts-style display-7" v-dompurify-html="errorpage?.content?.[0]?.name"></p>
                  <p class="mbr-text mbr-white mbr-fonts-style display-7" v-dompurify-html="message"></p>
                  <div class="mbr-section-btn align-center"><NuxtLink class="btn btn-primary display-4" :to="errorpage?.content?.[0]?.url">{{ errorpage?.content?.[0]?.url_name }}</NuxtLink></div>
              </div>
          </div>
      </div>
  </section>
</template>

<script setup lang="ts">
  const {
    $directus,
    $readItem,
  } = useNuxtApp()

  const {
    data: errorpage
  } = await useAsyncData('errorpage', () => {
    return $directus.request($readItem('page_blocks', '25', {
      fields: ['*',
        'media.*',
      ],
    }))
  })

const props = defineProps<{
  error?: {
    statusCode?: number
    statusMessage?: string
    message?: string
  }
}>()

const title = computed(() => {
  const code = props.error?.statusCode
  const text = props.error?.statusMessage || 'Something went wrong'
  return code ? `${code} ${text}` : text
})

const message = computed(() => props.error?.message || 'The demo app could not complete that request.')
</script>
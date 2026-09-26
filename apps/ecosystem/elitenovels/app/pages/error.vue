<template>
  <div>
    <div>
      <section data-bs-version="5.1" class="header4 cid-u48BYncuPn mbr-fullscreen" id="header4-87"
        data-sortbtn="btn-primary" :style="`background: url(${page?.image?.filename_disk})`">
        <div class="container">
          <div class="row">
            <div class="content-wrap">
              <h1 class="mbr-section-title mbr-fonts-style mbr-white mb-3 display-1">
                <strong>{{ page?.name }}</strong>
              </h1>

              <p class="mbr-fonts-style mbr-text mbr-white mb-3 display-7" style="color: white !important;"
                v-html="page?.content"></p>

              <div class="mbr-section-btn"><NuxtLink class="btn btn-primary display-4" :to="page?.url">Go Back</NuxtLink></div>
            </div>
          </div>
        </div>

        <h3 style="padding: 15px;">{{ page?.information[0]?.description }}</h3>
        <v-row>
          <v-col cols="12" sm="6" md="4" lg="3" v-for="characters in charactersData" :key="characters">
            <characters :character="characters" />
          </v-col>
        </v-row>
      </section>
    </div>
    <!---->
  </div>
</template>

<script setup>
import characters from '~/components/related/character.vue';
  const {
    $directus,
    $readItems,
    $readItem
  } = useNuxtApp()

  const {
    data: page
  } = useLazyAsyncData('errorPage', () => {
    return $directus.request($readItem('pages', '1'))
  })

  const {
    data: charactersData
  } = useLazyAsyncData('charactersData', () => {
    return $directus.request($readItems('characters'))
  })

  useHead({
    title: computed(() => page?.value?.name || 'Page Name')
  })
</script>
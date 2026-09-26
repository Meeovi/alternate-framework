<template>
  <div class="categoryPage">
    <!--<characterbar />-->
    <section data-bs-version="5.1" class="header01 emblemm5 cid-uLEdfj7dI6"
      :style="`background-image: url(/images/thelazaronbanner-900x357.png) !important`"
      id="header01-1k">
      <div class="container-fluid">
        <div class="row">
          <div class="col-12 col-lg-8">
            <div class="content-wrapper">
              <h2 class="mbr-section-title mbr-fonts-style display-1">
                <strong>{{ characterPage?.name }}</strong>
              </h2>
              <p class="mbr-text mbr-fonts-style display-4" v-html="characterPage?.content"></p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section data-bs-version="5.1" class="features01 emblemm5 cid-uLEfG2egqU" id="features01-1n">
      <div class="container">
        <div class="row">
          <div class="col-12">
            <div class="title-wrapper">
              <h2 class="mbr-section-title mbr-fonts-style display-2 color-title">
                Explore the Eliteverse
              </h2>
            </div>
          </div>
        </div>
        <div class="row items-wrapper">
          <div class="item features-image col-12 col-lg-4" v-for="block in characterBlocks" :key="block?.id">
            <div class="item-wrapper card_1">
              <div class="item-img">
                <img v-if="block?.images?.length" :src="`${$directus.url}assets/${block?.image?.filename_disk}`" :alt="block?.name" />

                <img v-else src="/images/mbr-1920x1080.jpg" alt="Elite Novels" />
              </div>
              <div class="card-box">
                <h4 class="item-title mbr-fonts-style display-5 color-title">
                  {{ block?.name }}
                </h4>
                <p class="item-text mbr-fonts-style display-4 color-title" v-html="block?.description"></p>
                <div class="mbr-section-btn item-footer">
                  <NuxtLink v-if="block?.content && block?.content[0]?.subject" :to="block?.content[0]?.subject"
                    class="btn item-btn btn-success display-4">
                    View More
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section data-bs-version="5.1" class="people3 cid-uLEeT3ZF2k" id="apeople3-1m">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-12 col-title">
            <h3 class="mbr-section-title mbr-fonts-style align-left mb-0 display-2">
              <strong>
                Characters from the Eliteverse
              </strong>
            </h3>

          </div>
          <v-row class="cards-container">
            <v-col cols="12" sm="6" md="4" lg="3" v-for="char in character" :key="char.id">
              <characterComponent :character="char" class="characterCard" />
            </v-col>
          </v-row>
        </div>
      </div>
    </section>
    <relatedstories />
  </div>
</template>

<script setup>
  import {
    ref
  } from 'vue'
  //import characterbar from '~/components/menus/characterbar.vue'
  import relatedstories from '~/components/related/relatedstories.vue'
  import characterComponent from '~/components/related/character.vue'
  //const model = ref(null);

  const {
    $directus,
    $readItems,
    $readItem
  } = useNuxtApp()

  const {
    data: character
  } = useLazyAsyncData('character', () => {
    return $directus.request($readItems('characters'))
  })

  const {
    data: characterPage
  } = useLazyAsyncData('characterPage', () => {
    return $directus.request($readItem('pages', '2', {
      fields: ['*', 'image.*'],
    }))
  })

  const {
    data: characterBlocks
  } = useLazyAsyncData('characterBlocks', () => {
    return $directus.request($readItems('blocks', {
      fields: ['*', 'image.*'],
      filter: {
        pages: {
          pages_id: {
            name: {
              _eq: 'Characters'
            }
          }
        }
      }
    }))
  })

  useHead({
    title: 'Characters',
  })
</script>
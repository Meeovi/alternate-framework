<template>
  <div class="categoryPage">
    <v-row style="background-color: khaki;">
      <v-col cols="12">
        <h4 style="color: black !important;">Popular Kids Characters</h4>
        <v-sheet class="mx-auto categorySheet">
          <v-slide-group v-model="model" class="py-4 px-sm-4" center-active>
            <v-slide-group-item v-for="char in kidsCharacter" :key="char.id"
              v-slot="{ toggle }">
              <characterComponent :character="char" :class="selectedClass" @click="toggle" />
            </v-slide-group-item>
          </v-slide-group>
        </v-sheet>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" sm="6" md="4" lg="3" v-for="kids in kidsCharacter" :key="kids">
        <characterComponent :character="kids" />
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import characterComponent from '~/components/related/character.vue'

  const model = ref(null);

  const {
        $directus,
        $readItems
    } = useNuxtApp()

  const {
    data: kidsCharacter
  } = useLazyAsyncData('kidsCharacter', () => {
    return $directus.request($readItems('characters', {
      fields: ['*',
        'abilities.abilities_id.*',
        'tags.tags_id.*',
        'options.options_id.*',
        'videos.videos_id.*',
        'universe.universe_id.*',
        'stories.stories_id.*',
        'image.*',
      ],
      filter: {
        universe: {
          universe_id: {
            name: {
              _eq: 'Kids'
            }
          }
        }
      }
    }))
  })

  useHead({
    title: 'Elite Kids',
  })
</script>
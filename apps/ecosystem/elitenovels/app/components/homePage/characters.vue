<template>
  <div>
    <v-row>
      <v-col cols="12">
        <v-toolbar title="POPULAR CHARACTERS" density="comfortable" color="transparent"></v-toolbar>
        <v-sheet class="mx-auto">
          <v-slide-group v-model="model" class="py-4 px-sm-4" center-active>
            <v-slide-group-item v-for="characters in popularCharacters" :key="characters">
              <template #default="{ toggle, selectedClass }">
                <charactersCard :character="characters" class="characterCard popCard" @click="toggle"
                  :class="selectedClass" />
              </template>
            </v-slide-group-item>
          </v-slide-group>
        </v-sheet>
      </v-col>

      <div style="background-image: url('/images/mbr-2-510x288.jpg'); width: 100%; background-position: center; background-size: cover;">
        <v-col cols="12">
          <v-toolbar title="SPELL CREATURES" density="comfortable" color="transparent"></v-toolbar>
          <v-sheet class="mx-auto">
            <v-slide-group v-model="model" class="py-4 px-sm-4" center-active>
              <v-slide-group-item v-for="monsters in monstersCharacters" :key="monsters">
                <template #default="{ toggle, selectedClass }">
                  <charactersCard :character="monsters" class="characterCard" @click="toggle"
                    :class="selectedClass" />
                </template>
              </v-slide-group-item>
            </v-slide-group>
          </v-sheet>
        </v-col>
      </div>

      <v-col cols="12">
        <v-toolbar title="CHARACTERS FROM MYTHOLOGY" density="comfortable" color="transparent"></v-toolbar>
        <v-sheet class="mx-auto">
          <v-slide-group v-model="model" class="py-4 px-sm-4" center-active>
            <v-slide-group-item v-for="mythology in mythologyCharacters" :key="mythology">
              <template #default="{ toggle, selectedClass }">
                <charactersCard :character="mythology" class="characterCard" @click="toggle"
                  :class="selectedClass" />
              </template>
            </v-slide-group-item>
          </v-slide-group>
        </v-sheet>
      </v-col>

      <div style="background-image: url('/images/mbr-1920x1343.jpg'); width: 100%;">
        <v-col cols="12">
          <v-toolbar title="FROM ACROSS THE ELITEVERSE" density="comfortable" color="transparent"></v-toolbar>
          <v-sheet class="mx-auto">
            <v-slide-group v-model="model" class="py-4 px-sm-4" center-active>
              <v-slide-group-item v-for="aliens in aliensCharacters" :key="aliens">
                <template #default="{ toggle, selectedClass }">
                  <charactersCard :character="aliens" class="characterCard" @click="toggle"
                    :class="selectedClass" />
                </template>
              </v-slide-group-item>
            </v-slide-group>
          </v-sheet>
        </v-col>
      </div>

      <v-col cols="12">
        <v-toolbar title="ELITE KIDS" density="comfortable" color="transparent"></v-toolbar>
        <v-sheet class="mx-auto">
          <v-slide-group v-model="model" class="py-4 px-sm-4" center-active>
            <v-slide-group-item v-for="kids in kidsCharacters" :key="kids">
              <template #default="{ toggle, selectedClass }">
                <charactersCard :character="kids" class="characterCard" @click="toggle"
                  :class="selectedClass" />
              </template>
            </v-slide-group-item>
          </v-slide-group>
        </v-sheet>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
  import {
    ref
  } from 'vue'
  import charactersCard from '~/components/related/character.vue'
  const model = ref(null);

  const {
    $directus,
    $readItems
  } = useNuxtApp()

  const {
    data: popularCharacters
  } = useLazyAsyncData('popularCharacters', () => {
    return $directus.request($readItems('characters', {
      fields: ['*', {
        '*': ['*']
      }],
      filter: {
        type: {
          _eq: "Individual"
        },
        universe: {
          universe_id: {
            name: {
              _eq: "Main Universe"
            }
          }
        }
      }
    }))
  })

  const {
    data: monstersCharacters
  } = useLazyAsyncData('monstersCharacters', () => {
    return $directus.request($readItems('characters', {
      fields: ['*', {
        '*': ['*']
      }],
      filter: {
        categories: {
          categories_id: {
            name: {
              _eq: "Monsters"
            }
          }
        }
      }
    }))
  })

  const {
    data: mythologyCharacters
  } = useLazyAsyncData('mythologyCharacters', () => {
    return $directus.request($readItems('characters', {
      fields: ['*', {
        '*': ['*']
      }],
      filter: {
        categories: {
          categories_id: {
            name: {
              _eq: "Mythology"
            }
          }
        }
      }
    }))
  })

  const {
    data: aliensCharacters
  } = useLazyAsyncData('aliensCharacters', () => {
    return $directus.request($readItems('characters', {
      fields: ['*', {
        '*': ['*']
      }],
      filter: {
        categories: {
          categories_id: {
            name: {
              _eq: "Aliens"
            }
          }
        }
      }
    }))
  })

  const {
    data: kidsCharacters
  } = useLazyAsyncData('kidsCharacters', () => {
    return $directus.request($readItems('characters', {
      fields: ['*', {
        '*': ['*']
      }],
      filter: {
        type: {
          _eq: "Individual"
        },
        universe: {
          universe_id: {
            name: {
              _eq: "Kids"
            }
          }
        }
      }
    }))
  })
</script>
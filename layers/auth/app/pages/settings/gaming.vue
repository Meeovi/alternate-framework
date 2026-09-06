<template>
    <div class="contentPage">
        <v-toolbar style="background-color: green; color: white;">
            <v-toolbar-title>{{ accountGaming?.name }}</v-toolbar-title>
        </v-toolbar>

        <v-divider></v-divider>

        <v-sheet>
            <v-row>
                <v-col cols="4" v-for="home in accountGaming?.repeaterTextBox" :key="home">
                    <v-card :href="`${home?.url}`">
                        <v-card-title>{{ home?.name }}</v-card-title>
                        <v-card-text>
                            {{ home?.description }}
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </v-sheet>
    </div>
</template>

<script setup>
    import { ref } from '#imports'
    
    const tab = ref(null)
    
    const {
        $directus,
        $readItems
    } = useNuxtApp()

    const {
      data: accountGaming
    } = await useAsyncData('accountGaming', async () => {
      const result = await $directus.request($readItems('pages', {
        filter: {
          slug: {
            _eq: 'gaming-settings'
          }
        },
        fields: '*',
        limit: 1
      }))
      return Array.isArray(result) ? result[0] : null
    })

  useHead({
    title: () => accountGaming.value?.name || 'Page',
  })
</script>
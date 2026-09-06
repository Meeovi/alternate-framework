<template>
    <div class="contentPage">
        <v-toolbar style="background-color: orange;">
            <v-toolbar-title>{{ accountShopping?.name }}</v-toolbar-title>
        </v-toolbar>

        <v-sheet>
            <v-row>
                <v-col cols="4" v-for="home in accountShopping?.repeaterTextBox" :key="home">
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
      data: accountShopping
    } = await useAsyncData('accountShopping', async () => {
      const result = await $directus.request($readItems('pages', {
        filter: {
          slug: {
            _eq: 'manage-your-shopping'
          }
        },
        fields: '*',
        limit: 1
      }))
      return Array.isArray(result) ? result[0] : null
    })

  useHead({
    title: () => accountShopping.value?.name || 'Page',
  })
</script>
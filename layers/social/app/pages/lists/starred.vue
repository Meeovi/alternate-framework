<template>
    <div class="contentPage">
        <v-toolbar color="green">
            <v-toolbar-title>Starred Tasks</v-toolbar-title>
        </v-toolbar>

        <v-row>
            <v-col v-for="starred in starredLists" :key="starred">
                <listCard :list="starred" />
            </v-col>
        </v-row>
    </div>
</template>

<script setup>
    import listCard from '#social/app/components/related/list.vue'
    import createList from '#social/app/components/blocks/partials/listBtn.vue'

  const { $directus, $readItem, $readItems } = useNuxtApp()

  const model = ref(null)

  const { data: starredLists } = await useAsyncData('starredLists', async () => {
    const resp = await $directus.request($readItems('lists', {
        filter: {
            favorite: {
                _eq: 'yes'
            },
            lists_type: {
                lists_type_id: {
                    name: {
                        _neq: 'Showcase'
                    }
                }
            }
        }
    }))
    return resp?.data || resp || []
  })

useHead({
    title: 'Starred Tasks'
})
</script>
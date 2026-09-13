<template>
    <div class="contentPage">
        <v-toolbar color="green">
            <v-toolbar-title>Archived Tasks</v-toolbar-title>
            
            <v-toolbar-items>
                <createList style="top: 20px; position: relative;" class="createListsToolbarItems" />
            </v-toolbar-items>
        </v-toolbar>

        <v-row>
            <v-col v-for="archived in archivedLists" :key="archived">
                <listCard :list="archived" />
            </v-col>
        </v-row>
    </div>
</template>

<script setup>
    import listCard from '#social/app/components/related/list.vue'
    import createList from '#social/app/components/blocks/partials/listBtn.vue'

  const { $directus, $readItem, $readItems } = useNuxtApp()

  const model = ref(null)

  const { data: archivedLists } = await useAsyncData('archivedLists', async () => {
    const resp = await $directus.request($readItems('lists', {
        filter: {
            status: {
                _eq: 'Archived'
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
    title: 'Archived Tasks'
})
</script>
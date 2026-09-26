<template>
    <v-card class="lowerbar" variant="text">
        <v-tabs style="background-color: sienna; color: white;" center-active>
            <h5>{{ characterbar?.name }}</h5>
            <!-- Update v-for to correctly access tags data -->
            <div v-for="tag in characterbar?.tags" :key="tag.tags_id.id">
                <v-tab>
                    <a style="color: white !important;" :href="`/characters/category/${tag.tags_id.id}`">
                        {{ tag.tags_id.name }}
                    </a>
                </v-tab>
            </div>
        </v-tabs>
    </v-card>
</template>

<script setup>
const { $directus, $readItem } = useNuxtApp()
const route = useRoute()

const { data: characterbar } = useLazyAsyncData('monsterbar', () => {
    return $directus.request($readItem('categories', '3', {
        fields: ['*', 'tags.tags_id.*'] // Include all tags fields
    }))
})
</script>

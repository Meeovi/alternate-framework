<template>
    <div>
        <v-row>
            <v-col>
                <v-card :disabled="loading" :loading="loading" class="mx-auto my-12" max-width="374">
                    <template v-slot:loader="{ isActive }">
                        <v-progress-linear :active="isActive" color="deep-purple" height="4"
                            indeterminate></v-progress-linear>
                    </template>

                    <v-img height="250" src="https://cdn.vuetifyjs.com/images/cards/cooking.png" cover></v-img>

                    <v-card-item>
                        <v-card-title>{{ restaurant?.name }}</v-card-title>

                        <v-card-subtitle>
                            <span class="me-1">Local Favorite</span>

                            <v-icon color="error" icon="fas fa-fire" size="small"></v-icon>
                        </v-card-subtitle>
                    </v-card-item>

                    <v-card-text>
                        <v-row align="center" class="mx-0">
                            <v-rating :model-value="restaurant?.rating" color="amber" density="compact" size="small" half-increments
                                readonly></v-rating>

                            <div class="text-grey ms-4">
                                {{ restaurant?.rating }} ({{ restaurant?.reviewCount }})
                            </div>
                        </v-row>

                        <div class="my-4 text-subtitle-1">
                            {{ restaurant?.currency }} • {{ restaurant?.cuisine }}, {{ restaurant?.type }}
                        </div>

                        <div>{{ restaurant?.description }}</div>
                    </v-card-text>

                    <v-divider class="mx-4 mb-1"></v-divider>

                    <v-card-title>Hours</v-card-title>

                    <div class="px-4 mb-2">
                        <v-chip-group v-model="selection" selected-class="bg-deep-purple-lighten-2">
                            <v-chip>{{ restaurant?.hours }}</v-chip>
                        </v-chip-group>
                    </div>

                    <v-card-actions>
                        <v-btn color="deep-purple-lighten-2" text="Come Inside" block border :href="`/outlet/${restaurant?.slug}`"></v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
    </div>
</template>

<script setup>

import { ref } from 'vue'

const props = defineProps({
    restaurant: {
        type: String,
        required: false,
        default: ''
    }
})

const loading = ref(false)
const selection = ref(1)

function reserve () {
  loading.value = true

  setTimeout(() => (loading.value = false), 2000)
}
</script>
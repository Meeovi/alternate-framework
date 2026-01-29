<template>
    <div>
        <v-card elevation="0">
            <v-toolbar :title="restaurant?.name" color="#1F7087"></v-toolbar>

            <v-card-text>
                <v-row>
                    <v-col cols="12" v-for="item in restaurant?.items" :key="item.id">
                        <v-list-item>
                            <v-list-item-content>
                                <v-list-item-title>{{ item.name }}</v-list-item-title>
                                <v-list-item-subtitle>{{ item.description }}</v-list-item-subtitle>
                            </v-list-item-content>
                        </v-list-item>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>
    </div>
</template>

<script setup>
    const props = defineProps({
        restaurant: Object
    })
</script>

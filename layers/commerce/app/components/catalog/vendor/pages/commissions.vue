<template>
    <v-card>
        <v-toolbar color="" title=""></v-toolbar>
        <v-tabs v-model="tab" bg-color="primary">
            <v-tab value="one">Item One</v-tab>
            <!--<v-tab value="two">Item Two</v-tab>
            <v-tab value="three">Item Three</v-tab>-->
        </v-tabs>

        <template #header>
            <v-tabs-window v-model="tab">
                <v-tabs-window-item value="one">
                    One
                </v-tabs-window-item>

                <v-tabs-window-item value="two">
                    Two
                </v-tabs-window-item>

                <v-tabs-window-item value="three">
                    Three
                </v-tabs-window-item>
            </v-tabs-window>
        </template>
    </v-card>
</template>



<script setup>
import { useCommerceAdapter, useContentAdapter } from '#imports'
void useCommerceAdapter()
void useContentAdapter()

    import {
        ref
    } from '#imports'

    const tab = ref(null);

    definePageMeta({
      layout: "sellers",
      middleware: ['authenticated'],
    });

    useHead({
        title: ''
    })
</script>
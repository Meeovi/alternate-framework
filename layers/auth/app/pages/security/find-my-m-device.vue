<template>
    <div>
        <v-toolbar>
            <v-toolbar-title>Find my M device</v-toolbar-title>
        </v-toolbar>

        <v-card class="mx-auto" subtitle="Save this device's location when it's connected to the internet. See below to locate it." title="Find my M Device">
            <template v-slot:prepend>
                <v-icon color="primary" icon="fas fa-locate"></v-icon>
            </template>
            <template v-slot:append>
                <v-switch label="Off" true-icon="mdi-check" false-icon="mdi-close"></v-switch>
            </template>
        </v-card>
    </div>
</template>

<script setup>
    import {
        ref
    } from '#imports'

    const tab = ref(null)

    useHead({
        title: 'Find My M Device'
    })
</script>
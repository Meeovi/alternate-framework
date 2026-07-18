<template>
    <div>
        <v-toolbar>
            <v-toolbar-title>Accessibility Settings</v-toolbar-title>
        </v-toolbar>

        <v-card>
            <v-card-text>
                
            </v-card-text>
        </v-card>
    </div>
</template>

<script setup>
    import { ref } from '#imports'
    
    const tab = ref(null)

    useHead({
        title: 'Accessibility Settings'
    })
</script>
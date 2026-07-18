<template>
    <div>
        <v-toolbar>
            <v-toolbar-title>Business Account Settings</v-toolbar-title>
        </v-toolbar>
    </div>
</template>

<script setup>
    import { ref } from '#imports'
    
    const tab = ref(null)

    useHead({
        title: 'Business Account Settings'
    })
</script>
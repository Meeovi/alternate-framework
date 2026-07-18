<template>
    <div>
        <v-toolbar>
            <v-toolbar-title>Time & Language Settings</v-toolbar-title>
        </v-toolbar>

        <v-divider></v-divider>

        <v-sheet>
            <LangSwitcher />
        </v-sheet>
    </div>
</template>

<script setup>
    import { ref } from '#imports'
    import LangSwitcher from '#shared/app/components/blocks/langSwitcher.vue'
    
    const tab = ref(null)
</script>
<template>
    <v-btn :color="color" class="m-btn" v-bind="$attrs">
        <NuxtPage />
    </v-btn>
</template>

<script setup lang="ts">
    defineProps < {
        color ? : string
    } > ()
</script>

<style scoped>
    .m-btn {
        @apply px-4 py-2 rounded-md;
    }
</style>
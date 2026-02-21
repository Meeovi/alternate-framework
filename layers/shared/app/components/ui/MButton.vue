<template>
    <UButton :color="color" class="m-btn" v-bind="$attrs">
        <slot />
    </UButton>
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
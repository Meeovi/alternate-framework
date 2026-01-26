<template>
    <v-text-field v-model="query" label="Search media" prepend-inner-icon="mdi-magnify" clearable @input="emitSearch" />
</template>

<script setup>
    import {
        ref
    } from 'vue'

    const query = ref('')
    const emit = defineEmits(['search'])

    function emitSearch() {
        emit('search', query.value)
    }
</script>
<script setup lang="ts">
    import {
        widgetRegistry
    } from '@meeovi/directus-client';

    const props = defineProps < {
        field: any;
        form: Record < string,
        any > ;
    } > ();

    const widget = widgetRegistry[props.field.widget];
</script>

<template>
    <div v-if="widget">
        <!-- Basic text input -->
        <TextInput v-if="widget.component === 'TextInput'" v-model="form[field.key]" :label="field.key" />

        <!-- Dropdown -->
        <SelectInput v-else-if="widget.component === 'SelectInput'" v-model="form[field.key]"
            :options="field.options?.choices" :label="field.key" />

        <!-- Repeater -->
        <RepeaterInput v-else-if="widget.component === 'RepeaterInput'" v-model="form[field.key]" :fields="field.fields"
            :label="field.key" />

        <!-- File upload -->
        <FileInput v-else-if="widget.component === 'FileInput'" v-model="form[field.key]" :label="field.key" />

        <!-- Fallback -->
        <TextInput v-else v-model="form[field.key]" :label="field.key" />
    </div>
</template>
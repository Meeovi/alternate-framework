<template>
    <v-select v-model="internalValue" :items="options" :label="label" :multiple="multiple" item-title="display"
        item-value="id" clearable />
</template>

<script setup lang="ts">
    import {
        ref,
        onMounted,
        computed
    } from 'vue';

    const props = defineProps({
        modelValue: {
            type: [String, Array],
            default: null
        },
        collection: {
            type: String,
            required: true
        }, // related collection name
        label: {
            type: String,
            default: ""
        },
        multiple: {
            type: Boolean,
            default: false
        },
    });

    const emit = defineEmits(["update:modelValue"]);
        const { $readItems } = useNuxtApp()

    const internalValue = computed({
        get: () => props.modelValue,
        set: (v: string | string[] | null) => emit("update:modelValue", v),
    });

    const options = ref<Array<{ id: string; display: string }>>([]);

    onMounted(async () => {
        try {
            const items = await readItems(props.collection, { limit: 50 })
            options.value = (items || []).map((item: any) => ({
                id: item.id,
                display: item.name || item.title || `Item ${item.id}`,
            }))
        } catch (err) {
            console.error("Failed to load relation options:", err);
        }
    });
</script>
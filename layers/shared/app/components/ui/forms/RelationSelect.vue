<template>
    <v-select v-model="internalValue" :items="options" :label="label" :multiple="multiple" item-title="display"
        item-value="id" clearable />
</template>

<script setup>
    import {
        ref,
        onMounted,
        computed
    } from "vue";

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
    const {
        $directus,
        $readItems
    } = useNuxtApp();

    const internalValue = computed({
        get: () => props.modelValue,
        set: (v) => emit("update:modelValue", v),
    });

    const options = ref([]);

    onMounted(async () => {
        try {
            const {
                data
            } = await $directus.request(
                $readItems(props.collection, {
                    limit: 50, // adjust as needed
                })
            );
            // Map to display-friendly format
            options.value = data.map((item) => ({
                id: item.id,
                display: item.name || item.title || `Item ${item.id}`,
            }));
        } catch (err) {
            console.error("Failed to load relation options:", err);
        }
    });
</script>
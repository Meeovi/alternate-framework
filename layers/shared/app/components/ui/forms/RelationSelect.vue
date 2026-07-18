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
    const { $directus, $readItems } = useNuxtApp()

    const internalValue = computed({
        get: () => props.modelValue,
        set: (v: string | string[] | null) => emit("update:modelValue", v),
    });

    const options = ref<Array<{ id: string; display: string }>>([]);

    const { data: relationOptions } = await useAsyncData(`relation-${props.collection}`, async () => {
        const items = await $directus.request($readItems(props.collection, { limit: 50 }))
        return (items || []).map((item: any) => ({
            id: item.id,
            display: item.name || item.title || `Item ${item.id}`,
        }))
    })

    const options = computed(() => relationOptions.value || [])
</script>
<template>
    <v-row>
        <v-col cols="12">
            <h6>Size</h6>
        </v-col>

        <v-col cols="12">
            <v-select v-model="selectedSize" :items="sizes" label="Select Size" item-value="id" item-title="name" single-line variant="solo" />
        </v-col>
    </v-row>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
const emit = defineEmits(['size-selected'])
const sizes = ref([])
const selectedSize = ref(null)


const nuxtApp = useNuxtApp()
const { $directus, $readItems } = nuxtApp

const loadSizes = async () => {
    try {
        const res = await $directus.request($readItems('attributes', {
            filter: {
                attribute_code: { _eq: 'size' }
            },
            sort: ['id']
        }))

        const attr = (res && res[0]) || null
        const opts = attr?.options || []
        sizes.value = opts.map((o, i) => ({ id: `${attr?.id || 'size'}-${i}`, name: o.name }))
    } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Failed to load size attributes', e)
        sizes.value = []
    }
}

watch(selectedSize, (newSize) => emit('size-selected', newSize))

onMounted(() => {
    loadSizes()
})
</script>
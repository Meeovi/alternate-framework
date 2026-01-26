<template>
    <v-row>
        <v-col cols="12">
            <h6>Color</h6>
        </v-col>

        <v-col cols="12">
            <v-container>
                <v-row>
                    <v-col cols="auto" v-for="color in colors" :key="color.id">
                        <v-btn density="compact" :style="`background-color: ${color.value || color.hex || color.name}`" :title="color.name"
                            @click="selectColor(color)">
                        </v-btn>
                    </v-col>
                </v-row>
            </v-container>
        </v-col>
    </v-row>
</template>

<script setup>
import { ref, onMounted } from 'vue'
const emit = defineEmits(['color-selected'])
const colors = ref([])
const selectedColor = ref(null)

const nuxtApp = useNuxtApp()
const { $directus, $readItems } = nuxtApp

const loadColors = async () => {
    try {
        const res = await $directus.request($readItems('attributes', {
            filter: {
                attribute_code: { _eq: 'color' }
            },
            sort: ['id']
        }))

        const attr = (res && res[0]) || null
        const opts = attr?.options || []
        // options may only have `name`; normalize to objects with id and value
        colors.value = opts.map((o, i) => ({ id: `${attr?.id || 'color'}-${i}`, name: o.name, value: o.name }))
    } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Failed to load color attributes', e)
        colors.value = []
    }
}

const selectColor = (color) => {
    selectedColor.value = color.value ?? color.id
    emit('color-selected', color)
}

onMounted(() => {
    loadColors()
})
</script>
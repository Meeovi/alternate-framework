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
import { ref, onMounted } from '#imports'

const emit = defineEmits(['color-selected'])
const colors = ref([])
const selectedColor = ref(null)

const { $sdk } = useNuxtApp()

const loadColors = async () => {
    try {
        const res = await $sdk.content.readItems('attributes', {
            filter: {
                attribute_code: { _eq: 'color' }
            },
            sort: ['id']
        })

        const attr = (res && res[0]) || null
        const opts = attr?.options || []
        colors.value = opts.map((o, i) => ({ id: `${attr?.id || 'color'}-${i}`, name: o.name, value: o.name }))
    } catch (e) {
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
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
    import { ref, computed, watch } from '#imports'

  const emit = defineEmits(['color-selected'])
  const selectedColor = ref(null)

  const {
    $directus,
    $readItems
  } = useNuxtApp()

  const {
    data: attrData
  } = await useAsyncData('colorAttrData', async () => {
    try {
      return await $directus.request($readItems('attributes', {
        filter: {
          attribute_code: { _eq: 'color' }
        },
        sort: ['id']
      }))
    } catch (e) {
      console.warn('Failed to load color attributes', e)
      return []
    }
  })

  const colors = computed(() => {
    const res = attrData.value
    const attr = (res && res[0]) || null
    const opts = attr?.options || []
    return opts.map((o, i) => ({ id: `${attr?.id || 'color'}-${i}`, name: o.name, value: o.name }))
  })

  const selectColor = (color) => {
    selectedColor.value = color.value ?? color.id
    emit('color-selected', color)
  }
</script>
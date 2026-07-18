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
    import { ref, computed, watch } from '#imports'

  const emit = defineEmits(['size-selected'])
  const selectedSize = ref(null)

  const {
    $directus,
    $readItems
  } = useNuxtApp()

  const {
    data: attrData
  } = await useAsyncData('attrData', async () => {
    try {
      return await $directus.request($readItems('attributes', {
        filter: {
          attribute_code: { _eq: 'size' }
        },
        sort: ['id']
      }))
    } catch (e) {
      console.warn('Failed to load size attributes', e)
      return []
    }
  })

  const sizes = computed(() => {
    const res = attrData.value
    const attr = (res && res[0]) || null
    const opts = attr?.options || []
    return opts.map((o, i) => ({ id: `${attr?.id || 'size'}-${i}`, name: o.name }))
  })

  watch(selectedSize, (newSize) => emit('size-selected', newSize))
</script>
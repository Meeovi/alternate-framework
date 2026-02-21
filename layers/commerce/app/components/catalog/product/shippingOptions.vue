<template>
    <v-row>
        <v-col cols="12">
            <h6>Delivery</h6>
        </v-col>

        <v-col cols="12">
            <USelect v-model="selected" :items="shippingOptions" item-title="name" item-value="id"
                label="Select Delivery Method" single-line variant="solo" :loading="loading"
                :disabled="loading || shippingOptions.length === 0"></USelect>
        </v-col>
    </v-row>
</template>

<script setup>
import { useCommerceAdapter, useContentAdapter } from '#imports'
void useCommerceAdapter()
void useContentAdapter()
import { onMounted, watch } from 'vue'
import { useShippingSelection } from '~/app/composables/cart/useShippingSelection'

const props = defineProps({
    modelValue: { type: [String, Number, null], default: null }
})
const emit = defineEmits(['shippingOption-selected', 'update:modelValue'])

const { shippingOptions, selected, loading, load } = useShippingSelection(props.modelValue)

onMounted(() => {
    load()
})

watch(() => props.modelValue, (val) => {
    if (val === selected.value) return
    selected.value = val
})

watch(selected, async (val) => {
    const option = shippingOptions.value.find((s) => s.id === val) || null
    // update parent v-model
    emit('update:modelValue', val)
    emit('shippingOption-selected', option)
})
</script>
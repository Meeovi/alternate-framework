<template>
    <div class="qrcode">
        <v-text-field 
            v-if="editable" 
            v-model="internalText" 
            :label="label" 
            :placeholder="placeholder" 
        />
        
        <NuxtImg provider="cloudinary" :src="qrcode" :alt="alt" />
    </div>
</template>

<script setup>
import { useQRCode } from '@vueuse/integrations/useQRCode'
import { shallowRef, watch } from 'vue'

const props = defineProps({
    text: {
        type: String,
        default: 'text-to-encode'
    },
    label: {
        type: String,
        default: 'Enter text'
    },
    placeholder: {
        type: String,
        default: ''
    },
    editable: {
        type: Boolean,
        default: true
    },
    alt: {
        type: String,
        default: 'QR Code'
    }
})

const internalText = shallowRef(props.text)
const qrcode = useQRCode(internalText)

watch(() => props.text, (newValue) => {
    internalText.value = newValue
})
</script>
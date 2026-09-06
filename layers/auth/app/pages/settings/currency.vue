<template>
    <div class="contentPage">
        <v-toolbar style="background-color: limegreen;">
            <v-toolbar-title>Currency Converter</v-toolbar-title>
        </v-toolbar>

        <iframe title="Wise Currency Converter"
            src="https://wise.com/gb/currency-converter/fx-widget/converter?sourceCurrency=GBP&targetCurrency=GBP"
            height="490" width="100%" frameborder="0" allowtransparency="true"></iframe>

        <v-toolbar color="transparent">
            <v-toolbar-title>Currency Chart</v-toolbar-title>
        </v-toolbar>

        <iframe ref="chartFrameRef" title="Wise Currency Chart"
            src="https://wise.com/gb/currency-converter/fx-widget/chart?sourceCurrency=GBP&targetCurrency=EUR"
            :height="chartHeight" width="100%" frameborder="0" allowtransparency="true"></iframe>
    </div>
</template>

<script setup>
    import {
        ref,
        onMounted,
        onUnmounted
    } from 'vue'

    useHead({
        title: 'Currency Converter'
    })

    // Bind explicit ref & reactive height state
    const chartFrameRef = ref(null)
    const chartHeight = ref(570)

    const handleMessage = (event) => {
        // Ensure we only respond to messages from our target iframe
        if (!chartFrameRef.value || event.source !== chartFrameRef.value.contentWindow) {
            return
        }

        // Update reactive height binding safely
        if (event.data && event.data.height) {
            chartHeight.value = event.data.height
        }
    }

    onMounted(() => {
        window.addEventListener('message', handleMessage)
    })

    onUnmounted(() => {
        window.removeEventListener('message', handleMessage)
    })
</script>
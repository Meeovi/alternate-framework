<template>
    <div>
        <div id="ww_5134399f73857" v='1.3' loc='auto' a='{"t":"responsive","lang":"en","sl_lpl":1,"ids":[],"font":"Arial","sl_ics":"one_a","sl_sot":"celsius","cl_bkg":"image","cl_font":"#FFFFFF","cl_cloud":"#FFFFFF","cl_persp":"#81D4FA","cl_sun":"#FFC107","cl_moon":"#FFC107","cl_thund":"#FF5722","cl_odd":"#0000000a"}'>Weather Data Source: <NuxtLink href="https://wetterlang.de" id="ww_5134399f73857_u" target="_blank">Wetter vorhersage 30 tage</NuxtLink></div>
    </div>
</template>

<script setup>
    import {
        onMounted,
        ref
    } from 'vue'

    const widgetId = 'ww_5134399f73857'

    const loadExternalScript = (src) => {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script')
            script.type = 'text/javascript';
            script.src = src
            script.async = true
            script.onload = resolve
            document.head.appendChild(script)
        })
    }

    onMounted(async () => {
        try {
            await loadExternalScript(`https://app3.weatherwidget.org/js/?id=${widgetId}`)
            // You may need a delay to allow the widget script to initialize
            setTimeout(() => {
                // Check if additional initialization is needed here
            }, 100)
        } catch (error) {
            console.error('Failed to load weather widget script:', error)
        }
    })

    const props = defineProps({
        category: {
            type: String,
            required: true,
        },
    });
</script>
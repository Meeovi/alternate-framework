<template>
    <div class="skyscanner-widget-wrapper">
        <div ref="widgetContainer" :data-skyscanner-widget="widget" :data-locale="locale" :data-market="market"
            :data-currency="currency"></div>
    </div>
</template>

<script setup lang="ts">
    import {
        ref,
        onMounted,
        watch,
        nextTick
    } from 'vue'

    interface SkyscannerProps {
        widget ? : string
        locale ? : string
        market ? : string
        currency ? : string
    }

    const props = withDefaults(defineProps < SkyscannerProps > (), {
        widget: 'SearchWidget',
        locale: 'en-GB',
        market: 'UK',
        currency: 'GBP'
    })

    const widgetContainer = ref < HTMLElement | null > (null)

    function loadWidget() {
        if (import.meta.server) return

        const existingScript = document.querySelector('script[src*="widgets.skyscanner.net"]')

        if (!existingScript) {
            const script = document.createElement('script')
            script.src = 'https://widgets.skyscanner.net/widget-server/js/loader.js'
            script.async = true
            script.onload = () => {
                if ((window as any).skyscanner?.widgets?.load) {
                    (window as any).skyscanner.widgets.load()
                }
            }
            document.head.appendChild(script)
        } else if ((window as any).skyscanner?.widgets?.load) {
            (window as any).skyscanner.widgets.load()
        }
    }

    onMounted(() => {
        loadWidget()
    })

    // Re-trigger Skyscanner parser when props change dynamically
    watch(
        () => [props.widget, props.locale, props.market, props.currency],
        async () => {
            await nextTick()
            if ((window as any).skyscanner?.widgets?.load) {
                (window as any).skyscanner.widgets.load()
            }
        }
    )
</script>

<style scoped>
    .skyscanner-widget-wrapper {
        width: 100%;
        min-height: 250px;
    }
</style>
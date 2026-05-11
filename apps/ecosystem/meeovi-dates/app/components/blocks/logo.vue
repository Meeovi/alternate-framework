<template>
    <div>
        <v-app-bar-title>
            <NuxtLink class="logobrand" href="/">
                <v-icon start size="small" icon="fa:fas fa-calendar"></v-icon>
                <p class="logotext">{{ blocksSiteoverview?.name }}</p>
            </NuxtLink>
        </v-app-bar-title>
    </div>
</template>

<script setup>
    import {
        ref
    } from 'vue'

    const gateway = useGateway()
    const content = gateway.content

    const {
        data: blocksSiteoverview
    } = await useAsyncData('blocksSiteoverview', () => {
        return content.readItem('page_blocks', '14', {
            fields: ['*', 'media.*.*'],
        })
    })
</script>
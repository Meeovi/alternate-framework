<template>
    <div>
        <div v-if="blocksSiteoverview?.media?.[0]?.file || blocksSiteoverview?.media?.[0]">
            <NuxtLink class="logobrand" :href="blocksSiteoverview?.slug">
                <v-icon start color="orange">
                    <NuxtImg provider="cloudinary" :src="`${$directus.url}/assets/${blocksSiteoverview?.media?.[0]?.file || blocksSiteoverview?.media?.[0]}`"
                        :alt="blocksSiteoverview?.name" />
                </v-icon>
                <p class="logotext">{{ blocksSiteoverview?.name }}<!--Pixanomy--></p>
            </NuxtLink>
        </div>

        <div v-else>
            <NuxtLink class="logobrand" :to="blocksSiteoverview?.url">
                <v-icon start color="orange">
                    <NuxtImg provider="cloudinary" src="/images/Firefly.png" :alt="blocksSiteoverview?.name" />
                </v-icon>
                <p class="logotext">{{ blocksSiteoverview?.name }}<!--Pixanomy--></p>
            </NuxtLink>
        </div>
    </div>
</template>

<script setup>
const { $directus, $readItem, $readItems } = useNuxtApp()

const { data: blocksSiteoverview } = await useAsyncData('blocksSiteoverview', async () => {
    const resp = await $directus.request($readItem('websites', '2', {
        fields: ['*'],
    }))
    return resp?.data || resp || {}
})

console.log(blocksSiteoverview.value?.name)
</script>
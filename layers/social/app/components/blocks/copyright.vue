<template>
    <section id="footer7-8c" data-bs-version="5.1" class="footer7 cid-u4ccfXoeP6" once="footers"
        data-sortbtn="btn-primary">
        <div class="container">
            <div class="row align-left justify-content-center mbr-white">
                <v-col v-for="child in copyright?.menus" cols="3" :key="child.id">
                    <v-list-item :value="child?.name" :prepend-icon="child?.icon"
                        :href="toPath(child?.slug)">
                        <v-list-item-title>{{ child?.name }}</v-list-item-title>
                    </v-list-item>
                </v-col>
                <v-col cols="12">
                    <p class="mbr-text mb-0 mbr-fonts-style display-7" style="width: 100%; text-align: center;">
                        {{ blocksCopyright?.content?.[0]?.subtitle }} {{ new Date().getFullYear() }}&nbsp;<NuxtLink
                            :to="blocksCopyright?.content?.[0]?.url">{{ blocksCopyright?.name }}&nbsp;&nbsp;</NuxtLink>
                        {{ blocksCopyright?.content?.[0]?.name }}
                    </p>
                </v-col>
            </div>
        </div>
    </section>
</template>

<script setup>
    import { useRoutePath } from '#shared/app/composables/routing/useRoutePath'
    import useContent from '#shared/app/composables/content/useContent'

    const { normalizeRoutePath } = useRoutePath()
    const toPath = (slug) => normalizeRoutePath(slug)
    
    const { readItem } = useContent()

    const { data: blocksCopyright } = await useAsyncData('blocksCopyright', () => {
        return readItem('page_blocks', '5', { fields: ['*', 'media.*.*'] })
    })

    const { data: copyright } = await useAsyncData('copyright', () => {
        return readItem('navigation', '10')
    })
</script>
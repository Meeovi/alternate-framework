<template>
    <div>
        <section data-bs-version="5.1" class="footer1 growthm5 cid-uLE9Kol17N" once="footers" id="afooter1-1j">
            <div class="container">
                <div class="row">
                    <div>
                        <v-avatar v-if="footerBlock?.image?.length" class="circle-bg" size="480">
                            <img :src="`${$directus.url}assets/${footerBlock?.image?.filename_disk}`" />
                        </v-avatar>

                        <v-avatar v-else class="circle-bg" size="480">
                            <img src="../../assets/images/enovelslogo.png" />
                        </v-avatar>
                    </div>
                    <div class="footer-top-container">
                        <div class="col-link">
                            <ul class="list mbr-fonts-style display-7"
                                v-for="child in aboutNav?.menus && aboutNav?.menus" :key="child.id">
                                <li class="mbr-text item-wrap">
                                    <NuxtLink class="text-white" :to="`${child.url}`">{{ child?.name }}</NuxtLink>
                                </li>
                            </ul>
                        </div>

                        <div class="col-link">
                            <ul class="list mbr-fonts-style display-7"
                                v-for="child in personalNav?.menus && personalNav?.menus" :key="child.id">
                                <li class="mbr-text item-wrap">
                                    <NuxtLink class="text-white" :to="`${child.url}`">{{ child?.name }}</NuxtLink>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div class="footer-text-wrap">
                        <h5 class="mbr-section-subtitle mbr-fonts-style display-1 color-title">
                            Step into the Eliteverse</h5>
                    </div>

                    <v-col class="text-center mt-4 legalFooter" v-for="(menu, index) in legalNav?.menus" :key="index">
                        <div>
                            <NuxtLink :to="`${menu?.url}`">
                                {{ menu?.name }}
                            </NuxtLink>
                        </div>
                    </v-col>

                    <div class="footer-bottom-container">
                        <div class="col-copyright">
                            <p class="mbr-text mb-0 mbr-fonts-style copyright align-center display-7 color-title">
                                {{ copyrightNav?.name }} {{ new Date().getFullYear() }} — <strong>
                                    <NuxtLink :to="copyrightNav?.url">{{ copyrightNav?.description }}</NuxtLink>
                                </strong>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
    const {
        $directus,
        $readItem
    } = useNuxtApp()
    const route = useRoute()

    const {
        data: aboutNav
    } = useLazyAsyncData('aboutNav', () => {
        return $directus.request($readItem('navigation', '2'))
    })

    const {
        data: legalNav
    } = useLazyAsyncData('legalNav', () => {
        return $directus.request($readItem('navigation', '3'))
    })

    const {
        data: personalNav
    } = useLazyAsyncData('personalNav', () => {
        return $directus.request($readItem('navigation', '4'))
    })

    const {
        data: copyrightNav
    } = useLazyAsyncData('copyrightNav', () => {
        return $directus.request($readItem('navigation', '5'))
    })

    const {
        data: footerBlock
    } = useLazyAsyncData('footerBlock', () => {
        return $directus.request($readItem('blocks', '1', {
            fields: ['*', {
                '*': ['*']
            }],
        }))
    })
</script>
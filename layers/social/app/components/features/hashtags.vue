<template>
    <div>
		<section data-bs-version="5.1" class="info1 cid-v5A0K07pfT" id="info1-bd" data-sortbtn="btn-primary">
			<div class="mbr-overlay" style="opacity: 0.5; background-color: rgb(68, 121, 217);"></div>
			<div class="align-center container">
				<div class="row justify-content-center">
					<div class="col-12 col-lg-8">
						<h3 class="mbr-section-title mb-4 mbr-fonts-style display-1">
							<strong> {{ hashtagPage?.name }}</strong>
						</h3>
						<p class="mbr-section-title mb-4 mbr-fonts-style display-7" v-dompurify-html="hashtagPage?.content"></p>
					</div>
				</div>
			</div>
		</section>

        <v-card variant="text">
            <v-toolbar :style="`background-color: ${tagBar?.color}; color: ${tagBar?.colortext} !important`">
                <v-toolbar-title>{{ tagBar?.name }}</v-toolbar-title>


                <v-tabs v-model="tab" align-tabs="center">
                    <div v-for="(menu, index) in tagBar?.menus" :key="index">
                        <v-tab :value="menu?.value">
                            <v-btn variant="text" :style="`color: ${tagBar?.colortext} !important`"
                                :href="menu?.slug">{{ menu?.name }}</v-btn>
                        </v-tab>
                    </div>
                </v-tabs>
            </v-toolbar>
        </v-card>

        <section data-bs-version="5.1" class="header6 cid-v0GHPMn349" id="header6-k">
            <div class="mbr-overlay" style="opacity: 0.3; background-color: rgb(1, 43, 58);">
            </div>

            <div>
                <div class="container">
                    <h5 class="mbr-section-title mbr-fonts-style display-4" v-dompurify-html="hashtagPage?.content"></h5>
                    <p class="mbr-text mbr-fonts-style display-1">{{ hashtagPage?.name }}</p>

                </div>
            </div>
        </section>

        <div class="text-center">
            <div v-for="hashtag in hashtags" :key="hashtag.id" class="d-inline-block">
                <tagChip :tag="hashtag" />
            </div>
        </div>
    </div>
</template>

<script setup>
    import {
        ref
    } from 'vue'
    import TagChip from '~/components/related/tag.vue'

    const {
        $directus,
        $readItems,
        $readItem
    } = useNuxtApp()
    const route = useRoute()
    const tab = ref(null);

    const {
        data: hashtags
    } = await useAsyncData('hashtags', () => {
        return $directus.request($readItems('tags', {
            fields: ['*', {
                '*': ['*']
            }]
        }))
    })

    const {
        data: hashtagPage
    } = await useAsyncData('hashtagPage', () => {
        return $directus.request($readItem('pages', '86', {
            fields: ['*', {
                '*': ['*']
            }]
        }))
    })

    const {
        data: tagBar
    } = await useAsyncData('tagBar', () => {
        return $directus.request($readItem('navigation', '78', {
            fields: ['*', {
                '*': ['*']
            }]
        }))
    })

    useHead({
        title: 'Hashtags',
    })
</script>
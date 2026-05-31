<template>
    <div>
		<section data-bs-version="5.1" class="info1 cid-v5A0K07pfT" id="info1-bd" data-sortbtn="btn-primary">
			<div class="mbr-overlay" style="opacity: 0.5; background-color: rgb(68, 121, 217);"></div>
			<div class="align-center container">
				<div class="row justify-content-center">
					<div class="col-12 col-lg-8">
						<h3 class="mbr-section-title mb-4 mbr-fonts-style display-1">
							<strong> {{ eventsPage?.name }}</strong>
						</h3>
						<p class="mbr-section-title mb-4 mbr-fonts-style display-7" v-dompurify-html="eventsPage?.content"></p>
					</div>
				</div>
			</div>
		</section>

        <v-card variant="text" class="lowerBar">
            <v-toolbar :style="`background-color: ${eventsBar?.color}; color: ${eventsBar?.colortext} !important`">
                <v-toolbar-title>{{ eventsBar?.name }}</v-toolbar-title>

                <v-tabs v-model="tab" align-tabs="center">
                    <div v-for="(menu, index) in eventsBar?.menus" :key="index">
                        <v-tab :value="menu?.value">
                            <v-btn variant="text"
                                :style="`color: ${eventsBar?.colortext} !important`">{{ menu?.name }}</v-btn>
                        </v-tab>
                    </div>
                </v-tabs>
            </v-toolbar>
        </v-card>

        <v-tabs-window v-model="tab">
            <v-tabs-window-item :value="eventsBar?.menus?.[0]?.value">
                <v-sheet class="pa-5">
                    <h2 class="text-center">All Events</h2>
                    <v-row class="member-cards">
                        <v-col cols="3" v-for="event in events" :key="event.id" class="d-inline-block">
                            <eventCard :event="event" />
                        </v-col>
                    </v-row>
                </v-sheet>
            </v-tabs-window-item>

            <v-tabs-window-item :value="eventsBar?.menus?.[1]?.value">
                <v-sheet class="pa-5">
                    <yourEvents />
                </v-sheet>
            </v-tabs-window-item>
        </v-tabs-window>
    </div>
</template>

<script setup>
    import {
        ref
    } from '#imports'
import useContent from '#shared/app/composables/content/useContent'
    import eventCard from '../../../../commerce/app/components/catalog/product/productCard.vue'
    import yourEvents from '#social/app/components/features/event/yourEvents.vue'

    const tab = ref(null);
    const { readItem, readItems } = useContent()

    const { data: eventsBar } = await useAsyncData('eventsBar', async () => {
        const resp = await readItem('navigation', '80', {
            fields: ['*', { '*': ['*'] }]
        })
        return resp?.data || resp || null
    })

    const { data: eventsPage } = await useAsyncData('eventsPage', async () => {
        const resp = await readItem('pages', '86', {
            fields: ['*', { '*': ['*'] }]
        })
        return resp?.data || resp || null
    })

    const { data: events } = await useAsyncData('events', async () => {
        const resp = await readItems('products', {
            fields: ['*', { '*': ['*'] }],
            filter: {
                product_types: {
                    product_types_id: { _eq: 'Events' }
                }
            }
        })
        return resp?.data || resp || []
    })

    useHead({
        title: 'Meeovi Events',
    })
</script>

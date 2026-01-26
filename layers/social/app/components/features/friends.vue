<template>
    <div>
		<section data-bs-version="5.1" class="info1 cid-v5A0K07pfT" id="info1-bd" data-sortbtn="btn-primary">
			<div class="mbr-overlay" style="opacity: 0.5; background-color: rgb(68, 121, 217);"></div>
			<div class="align-center container">
				<div class="row justify-content-center">
					<div class="col-12 col-lg-8">
						<h3 class="mbr-section-title mb-4 mbr-fonts-style display-1">
							<strong> {{ friendsPage?.name }}</strong>
						</h3>
						<p class="mbr-section-title mb-4 mbr-fonts-style display-7" v-dompurify-html="friendsPage?.content"></p>
					</div>
				</div>
			</div>
		</section>

        <v-card variant="text">
            <v-toolbar :style="`background-color: ${friendBar?.color}; color: ${friendBar?.colortext} !important`">

                <v-tabs v-model="tab" align-tabs="center">
                    <div v-for="(menu, index) in friendBar?.menus" :key="index">
                        <v-tab :value="menu?.value">
                            <v-btn variant="text" :style="`color: ${friendBar?.colortext} !important`"
                                :href="menu?.slug">{{ menu?.name }}</v-btn>
                        </v-tab>
                    </div>
                </v-tabs>
            </v-toolbar>
        </v-card>

        <v-tabs-window v-model="tab">
            <v-tabs-window-item :value="friendBar?.menus?.[0]?.value">
                <v-sheet class="pa-5" color="purple">
                    <div v-for="member in friends?.followers" :key="member.id" class="d-inline-block">
                        <memberCard :member="member?.followers_id" />
                    </div>
                </v-sheet>
            </v-tabs-window-item>
            <v-tabs-window-item :value="friendBar?.menus?.[1]?.value">
                <v-sheet class="pa-5" color="orange">
                    <div v-for="member in friendRequests" :key="member.id" class="d-inline-block">
                        <memberCard :member="member" />
                    </div>
                </v-sheet>
            </v-tabs-window-item>
            <v-tabs-window-item :value="friendBar?.menus?.[2]?.value">
                <v-sheet class="pa-5" color="brown">
                     <div v-for="member in suggestions" :key="member.id" class="d-inline-block">
                        <memberCard :member="member" />
                    </div>
                </v-sheet>
            </v-tabs-window-item>
            <!--<v-tabs-window-item :value="friendBar?.menus?.[3]?.value">
                <v-sheet class="pa-5" color="green">
                     <div v-for="member in membersList" :key="member.id" class="d-inline-block">
                        <memberCard :member="member" />
                    </div>
                </v-sheet>
            </v-tabs-window-item>-->
        </v-tabs-window>
    </div>
</template>

<script setup>
    import {
        ref
    } from 'vue'
    import memberCard from '~/components/related/memberList.vue'

    const {
        $directus,
        $readItem,
        $readItems
    } = useNuxtApp()
    const route = useRoute()
    const tab = ref(null);

    const {
        data: friendBar
    } = await useAsyncData('friendBar', () => {
        return $directus.request($readItem('navigation', '77', {
            fields: ['*', {
                '*': ['*']
            }]
        }))
    })

    const {
        data: friendsPage
    } = await useAsyncData('friendsPage', () => {
        return $directus.request($readItem('pages', '87', {
            fields: ['*', {
                '*': ['*']
            }]
        }))
    })

    const {
        data: friends
    } = await useAsyncData('members', () => {
        return $directus.request($readItems('profiles', {
            fields: ['*', {
                '*': ['*']
            }]
        }))
    })

    const {
        data: suggestions
    } = await useAsyncData('members', () => {
        return $directus.request($readItems('profiles', {
            fields: ['*', {
                '*': ['*']
            }]
        }))
    })

    const {
        data: membersList
    } = await useAsyncData('members', () => {
        return $directus.request($readItems('profiles', {
            fields: ['*', {
                '*': ['*']
            }]
        }))
    })

    useHead({
        title: 'Friend Center',
    })
</script>
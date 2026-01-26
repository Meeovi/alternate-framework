<template>
    <div>
        <section data-bs-version="5.1" class="info1 cid-v5A0K07pfT" id="info1-bd" data-sortbtn="btn-primary">
            <div class="mbr-overlay" style="opacity: 0.5; background-color: rgb(68, 121, 217);"></div>
            <div class="align-center container">
                <div class="row justify-content-center">
                    <div class="col-12 col-lg-8">
                        <h3 class="mbr-section-title mb-4 mbr-fonts-style display-1">
                            <strong> {{ birthdayPage?.name }}</strong>
                        </h3>
                        <p class="mbr-section-title mb-4 mbr-fonts-style display-7" v-dompurify-html="birthdayPage?.content"></p>
                    </div>
                </div>
            </div>
        </section>
        
        <v-card variant="text" class="lowerBar">
            <v-toolbar :style="`background-color: ${birthdayBar?.color}; color: ${birthdayBar?.colortext} !important`">
                <v-toolbar-title>{{ birthdayBar?.name }}</v-toolbar-title>

                <v-tabs v-model="tab" align-tabs="center">
                    <div v-for="(menu, index) in birthdayBar?.menus" :key="index">
                        <v-tab :value="menu?.value">
                            <v-btn variant="text"
                                :style="`color: ${birthdayBar?.colortext} !important`">{{ menu?.name }}</v-btn>
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
                    <h5 class="mbr-section-title mbr-fonts-style display-4" v-dompurify-html="birthdayPage?.content"></h5>
                    <p class="mbr-text mbr-fonts-style display-1">{{ birthdayPage?.name }}</p>

                </div>
            </div>
        </section>

        <v-tabs-window v-model="tab">
            <v-tabs-window-item :value="birthdayBar?.menus[0]?.value">
                <v-row>
                    <v-col cols="3" v-if="members?.length" v-for="members in members" :key="members.id">
                        <membersList :member="members" />
                    </v-col>

                    <div class="center-text" v-else>No Birthdays yet</div>
                </v-row>
            </v-tabs-window-item>

            <v-tabs-window-item :value="birthdayBar?.menus[1]?.value">
                <v-row>
                    <v-col cols="3" v-if="recentBirthdays?.length" v-for="recent in recentBirthdays" :key="recent.id">
                        <membersList :member="recent" />
                    </v-col>

                    <div class="center-text" v-else>No Recent Birthdays</div>
                </v-row>
            </v-tabs-window-item>
        </v-tabs-window>
    </div>
</template>

<script setup>
    import {
        ref
    } from 'vue'
    import MembersList from '~/components/related/membersList.vue'

    const {
        $directus,
        $readItem,
        $readItems,
    } = useNuxtApp()
    const tab = ref(null);

    const {
        data: birthdayBar
    } = await useAsyncData('birthdayBar', () => {
        return $directus.request($readItem('navigation', '82', {
            fields: ['*', {
                '*': ['*']
            }]
        }))
    })

    const {
        data: birthdayPage
    } = await useAsyncData('birthdayPage', () => {
        return $directus.request($readItem('pages', '91', {
            fields: ['*', {
                '*': ['*']
            }]
        }))
    })

    const {
        data: members
    } = await useAsyncData('members', () => {
        return $directus.request($readItems('profiles', {
            filter: {
                birth_date: {
                    _eq: new Date().toISOString().slice(5,
                        10) // Get current month and day in MM-DD format
                }
            },
            fields: [
                '*',
                'avatar.*'
            ],
            limit: 1
        })).then(response => response?.[0]) // Get first item from response
    })

    const {
        data: recentBirthdays
    } = await useAsyncData('recentBirthdays', () => {
        return $directus.request($readItems('profiles', {
            filter: {
                birth_date: {
                    _lt: new Date().toISOString().slice(5,
                        10) // Get current month and day in MM-DD format
                }
            },
            fields: [
                '*',
                'avatar.*'
            ],
            limit: 1
        })).then(response => response?.[0]) // Get first item from response
    })

    useHead({
        title: 'Birthdays Center',
    })
</script>
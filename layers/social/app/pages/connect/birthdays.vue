<template>
    <div class="contentPage">
        <v-card variant="text">
            <v-toolbar :style="`background-color: ${birthdayBar?.color}; color: ${birthdayBar?.colortext} !important`">
                <v-toolbar-title>
                    <div class="listsToolbarTitle">
                        {{ birthdayPage?.name }}
                        <v-tooltip interactive>
                            <template v-slot:activator="{ props: activatorProps }">
                                <v-icon-btn size="small" icon="fas fa-circle-info" v-bind="activatorProps"></v-icon-btn>
                            </template>
                            <div>
                                <p class="listsToolbarTooltip" v-dompurify-html="birthdayPage?.content"></p>
                            </div>
                        </v-tooltip>
                    </div>
                </v-toolbar-title>

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

        <v-tabs-window v-model="tab">
            <v-tabs-window-item :value="birthdayBar?.menus[0]?.value">
                <v-row>
                    <v-col cols="3" v-if="members?.length" v-for="member in members" :key="member.id">
                        <membersList :member="member" />
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
    import { ref } from '#imports'
    import MembersList from '#social/app/components/blocks/memberCard.vue'

    const { $directus, $readItem, $readItems } = useNuxtApp()
    const tab = ref(null)

    const { data: birthdayBar } = await useAsyncData('birthdayBar', () => {
        return $directus.request($readItem('navigation', '82', { fields: ['*', { '*': ['*'] }] }))
    })

    const { data: birthdayPage } = await useAsyncData('birthdayPage', () => {
        return $directus.request($readItem('pages', '91', { fields: ['*', { '*': ['*'] }] }))
    })

    const { data: members } = await useAsyncData('members', async () => {
        const resp = await $directus.request($readItems('profiles', {
            filter: { birth_date: { _eq: new Date().toISOString().slice(5, 10) } },
            fields: ['*', 'avatar.*'],
            limit: 1
        }))
        return Array.isArray(resp) ? resp : []
    })

    const { data: recentBirthdays } = await useAsyncData('recentBirthdays', async () => {
        const resp = await $directus.request($readItems('profiles', {
            filter: { birth_date: { _lt: new Date().toISOString().slice(5, 10) } },
            fields: ['*', 'avatar.*'],
            limit: 1
        }))
        return Array.isArray(resp) ? resp : []
    })

    useHead({
        title: 'Birthdays Center',
    })
</script>
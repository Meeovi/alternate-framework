<template>
    <div class="contentPage">
        <v-card variant="text">
            <v-toolbar :style="`background-color: ${birthdayBar?.color}; color: ${birthdayBar?.colortext} !important`">
                <v-toolbar-title>
                    <div class="listsToolbarTitle">
                        {{ birthdayPage?.name || 'Birthdays' }}
                        <v-tooltip v-if="birthdayPage?.content" interactive>
                            <template v-slot:activator="{ props: activatorProps }">
                                <v-icon-btn size="small" icon="fas fa-circle-info" v-bind="activatorProps"></v-icon-btn>
                            </template>
                            <div>
                                <p class="listsToolbarTooltip" v-dompurify-html="birthdayPage?.content"></p>
                            </div>
                        </v-tooltip>
                    </div>
                </v-toolbar-title>
            </v-toolbar>
        </v-card>

        <v-alert v-if="birthdays && !birthdays.available" type="info" variant="tonal" class="ma-4">
            Birthdays are being switched on. Check back soon.
        </v-alert>

        <template v-else>
            <v-tabs v-model="tab" align-tabs="center" class="mb-2">
                <v-tab value="today">Today <v-badge v-if="birthdays?.today?.length" :content="birthdays.today.length" inline color="primary" /></v-tab>
                <v-tab value="upcoming">Upcoming</v-tab>
                <v-tab value="settings">Your birthday</v-tab>
            </v-tabs>

            <v-alert v-if="pending" type="info" variant="text" class="ma-4">Loading birthdays…</v-alert>

            <v-tabs-window v-else v-model="tab">
                <v-tabs-window-item value="today">
                    <v-row v-if="greetable.length" class="pa-2">
                        <v-col v-for="person in greetable" :key="person.id" cols="12" sm="6" lg="4">
                            <BirthdayCard :person="person" :greeting="greeting" />
                        </v-col>
                    </v-row>
                    <div v-else class="center-text pa-6">
                        <p>None of the people you follow have a birthday today.</p>
                        <p class="text-medium-emphasis">Only people you follow appear here.</p>
                    </div>
                </v-tabs-window-item>

                <v-tabs-window-item value="upcoming">
                    <v-row v-if="later.length" class="pa-2">
                        <v-col v-for="person in later" :key="person.id" cols="12" sm="6" lg="4">
                            <BirthdayCard :person="person" :greeting="greeting" />
                        </v-col>
                    </v-row>
                    <div v-else class="center-text pa-6">No birthdays in the next 30 days.</div>
                </v-tabs-window-item>

                <v-tabs-window-item value="settings">
                    <div class="pa-2 birthdays-settings">
                        <BirthdaySettings :settings="settings" @saved="onSaved" />
                    </div>
                </v-tabs-window-item>
            </v-tabs-window>

            <v-alert v-if="birthdays?.available && !birthdays?.hasBirthDate && tab !== 'settings'" type="info" variant="tonal"
                class="ma-4">
                Add your birthday so the people who follow you can celebrate with you.
                <template #append>
                    <v-btn variant="text" @click="tab = 'settings'">Add it</v-btn>
                </template>
            </v-alert>
        </template>
    </div>
</template>

<script setup>
    import { computed, ref } from '#imports'
    import BirthdayCard from '#social/app/components/features/birthdays/BirthdayCard.vue'
    import BirthdaySettings from '#social/app/components/features/birthdays/BirthdaySettings.vue'

    const { $directus, $readItem } = useNuxtApp()
    const tab = ref('today')

    const { data: birthdayBar } = await useAsyncData('birthdayBar', () => {
        return $directus.request($readItem('navigation', '82', { fields: ['*', { '*': ['*'] }] }))
    })

    const { data: birthdayPage } = await useAsyncData('birthdayPage', () => {
        return $directus.request($readItem('pages', '91', { fields: ['*', { '*': ['*'] }] }))
    })

    // Birthdays depend on the viewer's own date (time zone), so they load in
    // the browser rather than during SSR.
    const localToday = () => {
        const now = new Date()
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    }
    const { data: birthdays, pending, refresh } = useLazyAsyncData('birthdays', () =>
        $fetch('/api/social/birthdays', { query: { today: localToday() } }), { server: false })
    const { data: settings, refresh: refreshSettings } = useLazyAsyncData('birthdays:settings', () =>
        $fetch('/api/social/birthdays/settings'), { server: false, default: () => ({ birthDate: null, greeting: 'post' }) })

    const greeting = computed(() => birthdays.value?.greeting || settings.value?.greeting || 'post')
    // Tomorrow's birthdays can already be wished (time zones), so they're listed with today's.
    const greetable = computed(() => [...(birthdays.value?.today || []), ...(birthdays.value?.upcoming || []).filter((p) => p.daysAway <= 1)])
    const later = computed(() => (birthdays.value?.upcoming || []).filter((p) => p.daysAway > 1))

    function onSaved() {
        refresh()
        refreshSettings()
    }

    definePageMeta({
        middleware: 'auth'
    })

    useHead({
        title: 'Birthdays',
    })
</script>

<style scoped>
    .birthdays-settings {
        max-width: 560px;
        margin: 0 auto;
    }
</style>

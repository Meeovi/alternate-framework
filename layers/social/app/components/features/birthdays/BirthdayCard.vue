<template>
    <v-card class="birthday-card" variant="outlined">
        <v-card-item>
            <template #prepend>
                <v-avatar size="48" color="primary">
                    <v-img v-if="person.image" :src="person.image" :alt="person.name" />
                    <span v-else>{{ initials }}</span>
                </v-avatar>
            </template>
            <v-card-title>
                <NuxtLink :to="profilePath" class="birthday-card__name">{{ person.name }}</NuxtLink>
            </v-card-title>
            <v-card-subtitle>{{ when }}</v-card-subtitle>
        </v-card-item>

        <v-card-text v-if="canGreet">
            <v-alert v-if="sent" type="success" density="compact" variant="tonal">
                {{ sent === 'post' ? 'Posted on their profile.' : 'Message sent.' }}
            </v-alert>
            <template v-else>
                <v-textarea v-model="text" rows="2" auto-grow density="compact" variant="outlined" hide-details="auto"
                    :counter="1000" :maxlength="1000" :label="`Write on ${firstName}'s birthday`" />
                <v-alert v-if="error" type="error" density="compact" variant="tonal" class="mt-2">{{ error }}</v-alert>
            </template>
        </v-card-text>

        <v-card-actions v-if="canGreet && !sent">
            <v-btn color="primary" variant="flat" :loading="sending === preferred" :disabled="!!sending || !text.trim()"
                :prepend-icon="icons[preferred]" @click="send(preferred)">
                {{ labels[preferred] }}
            </v-btn>
            <v-btn variant="text" :loading="sending === other" :disabled="!!sending || !text.trim()"
                :prepend-icon="icons[other]" @click="send(other)">
                {{ labels[other] }}
            </v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup>
    import { computed, ref } from 'vue'

    const props = defineProps({
        /** { id, name, username, image, month, day, daysAway } from /api/social/birthdays. */
        person: { type: Object, required: true },
        /** The viewer's preferred way to send wishes: 'post' | 'message'. */
        greeting: { type: String, default: 'post' },
    })

    const labels = { post: 'Post on their profile', message: 'Send a message' }
    const icons = { post: 'fas fa-pen', message: 'fas fa-envelope' }

    const firstName = computed(() => String(props.person.name || '').trim().split(/\s+/)[0] || 'them')
    const initials = computed(() => String(props.person.name || '?').trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase())
    const profilePath = computed(() => `/u/${encodeURIComponent(props.person.username || props.person.id)}`)

    const preferred = computed(() => (props.greeting === 'message' ? 'message' : 'post'))
    const other = computed(() => (preferred.value === 'post' ? 'message' : 'post'))

    // Wishes are accepted on the day and a day either side (time zones), so
    // tomorrow's birthdays can be greeted too.
    const canGreet = computed(() => props.person.daysAway <= 1)

    const when = computed(() => {
        if (props.person.daysAway === 0) return '🎂 Birthday today'
        if (props.person.daysAway === 1) return 'Birthday tomorrow'
        const date = new Date(Date.UTC(2000, props.person.month - 1, props.person.day))
        const label = date.toLocaleDateString(undefined, { day: 'numeric', month: 'long', timeZone: 'UTC' })
        return `${label} · in ${props.person.daysAway} days`
    })

    const text = ref(`Happy birthday, ${firstName.value}! 🎉`)
    const sending = ref('')
    const sent = ref('')
    const error = ref('')

    const localToday = () => {
        const now = new Date()
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    }

    async function send(via) {
        sending.value = via
        error.value = ''
        try {
            await $fetch('/api/social/birthdays/greet', {
                method: 'POST',
                body: { userId: props.person.id, text: text.value.trim(), via, today: localToday() },
            })
            sent.value = via
        } catch (e) {
            error.value = e?.data?.statusMessage || e?.statusMessage || "That didn't send. Please try again."
        } finally {
            sending.value = ''
        }
    }
</script>

<style scoped>
    .birthday-card__name {
        color: inherit;
        text-decoration: none;
    }

    .birthday-card__name:hover {
        text-decoration: underline;
    }
</style>

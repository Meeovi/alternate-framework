<template>
    <v-card variant="outlined" class="pa-2">
        <v-card-title>Your birthday</v-card-title>
        <v-card-subtitle class="birthday-settings__sub">
            People who follow you see the day and month, never the year.
        </v-card-subtitle>

        <v-card-text>
            <v-text-field v-model="birthDate" type="date" label="Date of birth" variant="outlined" density="comfortable"
                :max="maxDate" min="1900-01-01" clearable hide-details="auto" class="mb-4" />

            <p class="text-subtitle-2 mb-1">When it's someone's birthday, I'd like to</p>
            <v-radio-group v-model="greeting" hide-details>
                <v-radio value="post" label="Post on their profile" />
                <v-radio value="message" label="Send them a private message" />
            </v-radio-group>

            <v-alert v-if="saved" type="success" density="compact" variant="tonal" class="mt-3">Saved.</v-alert>
            <v-alert v-if="error" type="error" density="compact" variant="tonal" class="mt-3">{{ error }}</v-alert>
        </v-card-text>

        <v-card-actions>
            <v-btn color="primary" variant="flat" :loading="saving" @click="save">Save</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup>
    import { ref, watch } from 'vue'

    const props = defineProps({
        /** { birthDate: 'YYYY-MM-DD' | null, greeting: 'post' | 'message' } */
        settings: { type: Object, default: () => ({ birthDate: null, greeting: 'post' }) },
    })
    const emit = defineEmits(['saved'])

    const birthDate = ref(props.settings.birthDate || '')
    const greeting = ref(props.settings.greeting || 'post')
    watch(() => props.settings, (value) => {
        birthDate.value = value?.birthDate || ''
        greeting.value = value?.greeting || 'post'
    })

    const maxDate = new Date().toISOString().slice(0, 10)
    const saving = ref(false)
    const saved = ref(false)
    const error = ref('')

    async function save() {
        saving.value = true
        saved.value = false
        error.value = ''
        try {
            const result = await $fetch('/api/social/birthdays/settings', {
                method: 'PUT',
                body: { birthDate: birthDate.value || null, greeting: greeting.value },
            })
            saved.value = true
            emit('saved', result)
        } catch (e) {
            error.value = e?.data?.statusMessage || e?.statusMessage || "That didn't save. Please try again."
        } finally {
            saving.value = false
        }
    }
</script>

<style scoped>
    .birthday-settings__sub {
        white-space: normal;
    }
</style>

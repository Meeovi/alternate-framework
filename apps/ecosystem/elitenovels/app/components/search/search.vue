<template>
    <div id="minSearch">
        <div class="text-center">
            <v-dialog v-model="dialog" width="600" max-width="95vw">
                <template v-slot:activator="{ props }">
                    <v-btn v-bind="props" variant="text" icon="fas:fa fa-search" aria-label="Search"></v-btn>
                </template>

                <template v-slot:default="{ isActive }">
                    <v-card class="searchCard">
                        <v-card-text>
                            <v-text-field v-model="query" autofocus clearable hide-details variant="outlined"
                                placeholder="Search characters, abilities, places, stories…"
                                prepend-inner-icon="fas fa-search" :loading="pending" @keydown.enter="openResults" />

                            <v-list v-if="suggestions.length" density="compact" class="mt-2">
                                <v-list-item v-for="hit in suggestions" :key="hit.objectID" :to="hit.path"
                                    @click="dialog = false">
                                    <v-list-item-title>{{ hit.title }}</v-list-item-title>
                                    <template #append>
                                        <v-chip size="x-small" variant="tonal" class="text-capitalize">{{ hit.type }}</v-chip>
                                    </template>
                                </v-list-item>
                            </v-list>
                            <p v-else-if="searched && !pending" class="mt-3 text-medium-emphasis">
                                No matches for “{{ query }}”.
                            </p>
                        </v-card-text>
                        <v-card-actions>
                            <v-btn color="primary" variant="flat" :disabled="!query?.trim()" @click="openResults">
                                See all results
                            </v-btn>
                            <v-spacer />
                            <v-btn @click="isActive.value = false">Close</v-btn>
                        </v-card-actions>
                    </v-card>
                </template>
            </v-dialog>
        </div>
    </div>
</template>

<script setup>
    import { ref, watch } from 'vue'

    // Site search via layers/search (/api/search), which queries the novels
    // Directus live — replaces the Google Programmable Search widget, whose
    // crawler lagged behind new pages.
    const dialog = ref(false)
    const query = ref('')
    const suggestions = ref([])
    const pending = ref(false)
    const searched = ref(false)

    let timer = null
    let requestId = 0

    watch(query, (value) => {
        clearTimeout(timer)
        const term = value?.trim() || ''
        if (term.length < 2) {
            suggestions.value = []
            searched.value = false
            return
        }
        timer = setTimeout(() => suggest(term), 300)
    })

    async function suggest(term) {
        const id = ++requestId
        pending.value = true
        try {
            const res = await $fetch('/api/search', { query: { q: term, pageSize: 6 } })
            if (id !== requestId) return
            suggestions.value = (res?.items || []).filter((hit) => hit.path)
        } catch {
            if (id === requestId) suggestions.value = []
        } finally {
            if (id === requestId) {
                pending.value = false
                searched.value = true
            }
        }
    }

    function openResults() {
        const term = query.value?.trim()
        if (!term) return
        dialog.value = false
        navigateTo({ path: '/results', query: { q: term } })
    }
</script>

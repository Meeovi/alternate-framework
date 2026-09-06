<template>
	<div class="contentPage">
        <v-toolbar :style="`background-color: ${memberBar?.color}; color: ${memberBar?.colortext} !important`">
            <v-toolbar-title>
                <div class="listsToolbarTitle">
                    {{ memberBar?.name }}
                    <v-tooltip interactive>
                        <template v-slot:activator="{ props: activatorProps }">
                            <v-icon-btn size="small" icon="fas fa-circle-info" v-bind="activatorProps"></v-icon-btn>
                        </template>
                        <div>
                            <p class="listsToolbarTooltip" v-dompurify-html="memberBar?.description"></p>
                        </div>
                    </v-tooltip>
                </div>
            </v-toolbar-title>
        </v-toolbar>

		<v-row style="padding-top: 30px;">
			<v-col cols="3" v-for="members in membersList" :key="members.id">
				<membersCard :member="members" />
			</v-col>
		</v-row>
	</div>
</template>

<script setup>
    import { computed } from '#imports'
    import membersCard from '#social/app/components/blocks/memberCard.vue'

    useHead({
        title: 'Creatives Area',
    })

    const { $directus, $readItem, $readItems } = useNuxtApp()

    const { data: memberPage } = await useAsyncData('memberPage', () => {
        return $directus.request($readItem('pages', '98', { fields: ['*', { '*': ['*'] }] }))
    })

    const { data: memberBar } = await useAsyncData('memberBar', () => {
        return $directus.request($readItem('navigation', '131', { fields: ['*', { '*': ['*'] }] }))
    })

    const { data: directusMembersList } = await useAsyncData('members', () => {
        return $directus.request($readItems('users', { fields: ['*', 'avatar.*'], sort: '-created_at' }))
    })

    // atproto "accounts you might like" — the atproto match for this
    // page's members listing (see
    // server/api/social/atproto/suggested-members.get.ts). Resolves to
    // `{ items: [] }` (never throws) if the service-account atproto client
    // isn't configured or the PDS is unreachable, so this is purely
    // additive to the Directus-backed users above.
    const { data: atprotoMembers } = await useAsyncData('members:atprotoSuggested', () => $fetch('/api/social/atproto/suggested-members'), { default: () => ({ items: [] }) })

    const membersList = computed(() => [
        ...(directusMembersList.value || []),
        ...(atprotoMembers.value?.items || []),
    ])
</script>
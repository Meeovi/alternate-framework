<template>
	<div>
        <v-toolbar :style="`background-color: ${memberBar?.color}; color: ${memberBar?.colortext} !important`">
            <v-toolbar-title>
                <div class="listsToolbarTitle">
                    {{ memberPage?.name }}
                    <v-tooltip interactive>
                        <template v-slot:activator="{ props: activatorProps }">
                            <v-icon-btn size="small" icon="fas fa-circle-info" v-bind="activatorProps"></v-icon-btn>
                        </template>
                        <div>
                            <p class="listsToolbarTooltip" v-dompurify-html="memberPage?.content"></p>
                        </div>
                    </v-tooltip>
                </div>
            </v-toolbar-title>
            </v-toolbar>

		<v-row>
			<v-col cols="3" v-for="members in members" :key="members.id">
				<membersCard :member="members" />
			</v-col>
		</v-row>
	</div>
</template>

<script setup>
    import membersCard from '#social/app/components/related/memberList.vue'

    useHead({
        title: 'Members Area',
    })

    const { $directus, $readItem, $readItems } = useNuxtApp()

    const { data: memberPage } = await useAsyncData('memberPage', () => {
        return $directus.request($readItem('pages', '98', { fields: ['*', { '*': ['*'] }] }))
    })

    const { data: memberBar } = await useAsyncData('memberBar', () => {
        return $directus.request($readItem('navigation', '98', { fields: ['*', { '*': ['*'] }] }))
    })

    const { data: members } = await useAsyncData('members', () => {
        return $directus.request($readItems('members', { fields: ['*', 'avatar.*'], sort: '-created_on' }))
    })
</script>
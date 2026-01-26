<template>
	<div>
		<section data-bs-version="5.1" class="info1 cid-v5A0K07pfT" id="info1-bd" data-sortbtn="btn-primary">
			<div class="mbr-overlay" style="opacity: 0.5; background-color: rgb(68, 121, 217);"></div>
			<div class="align-center container">
				<div class="row justify-content-center">
					<div class="col-12 col-lg-8">
						<h3 class="mbr-section-title mb-4 mbr-fonts-style display-1">
							<strong> {{ memberPage?.name }}</strong>
						</h3>
						<p class="mbr-section-title mb-4 mbr-fonts-style display-7" v-dompurify-html="memberPage?.content"></p>
					</div>
				</div>
			</div>
		</section>

		<v-row>
			<v-col cols="3" v-for="members in members" :key="members.id">
				<membersCard :member="members" />
			</v-col>
		</v-row>
	</div>
</template>

<script setup>
	import membersCard from '~/components/related/membersList.vue'

	useHead({
		title: 'Members Area',
	})

	const {
		$directus,
		$readItems,
		$readItem
	} = useNuxtApp();

	const {
		data: memberPage
	} = await useAsyncData('memberPage', () => {
		return $directus.request($readItem('pages', '98', {
			fields: ['*', {
				'*': ['*']
			}]
		}))
	})

	const {
		data: members
	} = await useAsyncData('members', () => {
		return $directus.request($readItems('members', {
			fields: [
				'*',
				'avatar.*'
			],
			sort: '-created_on'
		}))
	})
</script>
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
						<p class="mbr-section-title mb-4 mbr-fonts-style display-7" v-dompurify-html="friendsPage?.description"></p>
					</div>
				</div>
			</div>
		</section>

        <v-card variant="text">
            <v-toolbar :style="`background-color: ${friendBar?.color}; color: ${friendBar?.colortext} !important`">

                <v-tabs v-model="tab" align-tabs="center">
                    <div v-for="(menu, index) in friendBar?.menus" :key="index">
                        <v-tab :value="menu?.value">
                            <v-btn variant="text" :style="`color: ${friendBar?.colortext} !important`">{{ menu?.name }}</v-btn>
                        </v-tab>
                    </div>
                </v-tabs>
            </v-toolbar>
        </v-card>

        <v-tabs-window v-model="tab">
            <v-tabs-window-item :value="friendBar?.menus?.[0]?.value">
                <v-sheet class="pa-5">
                    <div v-for="member in followers" :key="member.id" class="d-inline-block">
                        <MemberCard :member="member" />
                    </div>
                    <div v-if="!loading && (!followers || followers.length === 0)" class="center-text">No followers yet.</div>
                </v-sheet>
            </v-tabs-window-item>

            <v-tabs-window-item :value="friendBar?.menus?.[1]?.value">
                <v-sheet class="pa-5">
                    <div v-for="request in friendRequests" :key="request.id" class="d-inline-block">
                        <MemberCard :member="request.requester" />
                    </div>
                    <div v-if="!loading && (!friendRequests || friendRequests.length === 0)" class="center-text">No friend requests.</div>
                </v-sheet>
            </v-tabs-window-item>

            <v-tabs-window-item :value="friendBar?.menus?.[2]?.value">
                <v-sheet class="pa-5">
                    <div v-for="suggestion in suggestions" :key="suggestion.id" class="d-inline-block">
                        <MemberCard :member="suggestion.profile" />
                    </div>
                    <div v-if="!loading && (!suggestions || suggestions.length === 0)" class="center-text">No suggestions right now.</div>
                </v-sheet>
            </v-tabs-window-item>

            <v-tabs-window-item :value="friendBar?.menus?.[3]?.value">
                <v-sheet class="pa-5">
                    <div v-for="member in members" :key="member.id" class="d-inline-block">
                        <MemberCard :member="member.profile" />
                    </div>
                    <div v-if="!loading && (!members || members.length === 0)" class="center-text">No members found.</div>
                </v-sheet>
            </v-tabs-window-item>
        </v-tabs-window>

        <v-overlay v-model="loading" class="align-center justify-center">
            <v-progress-circular indeterminate size="64" color="primary" />
        </v-overlay>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import useFriendsPageData from '../../composables/contacts/useFriendsPageData'
import MemberCard from '../../components/related/memberList.vue'

const { friendBar, friendsPage, followers, friendRequests, suggestions, members, reloadData } = useFriendsPageData()
const tab = ref('followers')
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  await reloadData()
  loading.value = false
})

useHead({
  title: friendsPage?.value?.name || 'Friends',
})
</script>

<style>
.center-text {
  text-align: center;
  padding: 24px;
  color: #666;
}
</style>

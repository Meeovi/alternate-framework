<template>
    <div class="contentPage">
        <v-card variant="text">
            <v-toolbar :style="`background-color: ${friendBar?.color}; color: ${friendBar?.colortext} !important`">
                <v-toolbar-title>
                    <div class="listsToolbarTitle">
                        {{ friendsPage?.name }}
                        <v-tooltip interactive>
                            <template v-slot:activator="{ props: activatorProps }">
                                <v-icon-btn size="small" icon="fas fa-circle-info" v-bind="activatorProps"></v-icon-btn>
                            </template>
                            <div>
                                <p class="listsToolbarTooltip" v-dompurify-html="friendsPage?.content"></p>
                            </div>
                        </v-tooltip>
                    </div>
                </v-toolbar-title>

                <v-tabs v-model="tab" align-tabs="center">
                    <div v-for="(menu, index) in friendBar?.menus" :key="index">
                        <v-tab :value="menu?.value">
                            <v-btn variant="text"
                                :style="`color: ${friendBar?.colortext} !important`">{{ menu?.name }}</v-btn>
                        </v-tab>
                    </div>
                </v-tabs>
            </v-toolbar>
        </v-card>

        <!-- Search and sort every tab's members (kept in the page address) -->
        <SortFilterBar :controller="friendControls" :count="shownCount" :total="totalCount" noun="people"
            search-label="Search people" />
        <v-tabs-window v-model="tab">
            <v-tabs-window-item :value="friendBar?.menus?.[0]?.value">
                <v-sheet class="pa-5">
                    <div v-for="row in shownFollowers" :key="row.key" class="d-inline-block">
                        <MemberCard :member="row.member" />
                    </div>
                    <div v-if="!loading && (!followers || followers.length === 0)" class="center-text">No followers yet.</div>
                </v-sheet>
            </v-tabs-window-item>

            <v-tabs-window-item :value="friendBar?.menus?.[1]?.value">
                <v-sheet class="pa-5">
                    <div v-for="row in shownRequests" :key="row.key" class="d-inline-block">
                        <MemberCard :member="row.member" />
                    </div>
                    <div v-if="!loading && (!friendRequests || friendRequests.length === 0)" class="center-text">No friend requests.</div>
                </v-sheet>
            </v-tabs-window-item>

            <v-tabs-window-item :value="friendBar?.menus?.[2]?.value">
                <v-sheet class="pa-5">
                    <div v-for="row in shownSuggestions" :key="row.key" class="d-inline-block">
                        <MemberCard :member="row.member" />
                    </div>
                    <div v-if="!loading && (!suggestions || suggestions.length === 0)" class="center-text">No suggestions right now.</div>
                </v-sheet>
            </v-tabs-window-item>

            <v-tabs-window-item :value="friendBar?.menus?.[3]?.value">
                <v-sheet class="pa-5">
                    <div v-for="row in shownMembers" :key="row.key" class="d-inline-block">
                        <MemberCard :member="row.member" />
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
import { computed, ref } from 'vue'
import SortFilterBar from '#shared/app/components/SortFilterBar.vue'
import { byDate, byText, useSortFilter } from '#shared/app/composables/useSortFilter'
import { itemDate, itemName } from '../../utils/contentSortFilter'
import useFriendsPageData from '../../composables/contacts/useFriendsPageData'
import MemberCard from '../../components/blocks/memberCard.vue'

const { friendBar, friendsPage, followers, friendRequests, suggestions, members, reloadData } = useFriendsPageData()
const tab = ref('followers')

// Each tab's rows as { key, member } (requests and suggestions wrap the
// member), searched and sorted by the member.
type Row = { key: string, member: any }
const friendControls = useSortFilter<Row>({
  id: 'friends',
  sorts: [
    { value: 'name', title: 'Name: A to Z', compare: byText((r) => itemName(r.member)) },
    { value: 'name-desc', title: 'Name: Z to A', compare: byText((r) => itemName(r.member), true) },
    { value: 'newest', title: 'Newest', compare: byDate((r) => itemDate(r.member)) },
    { value: 'oldest', title: 'Oldest', compare: byDate((r) => itemDate(r.member), false) },
  ],
  search: (r) => [itemName(r.member), r.member?.username, r.member?.handle].join(' '),
})
const rowsOf = (items: any, member: (item: any) => any) =>
  ((items?.value ?? items ?? []) as any[]).map((item, i) => ({ key: String(item?.id ?? i), member: member(item) }))
    .filter((row) => row.member)
const allRows = () => [
  rowsOf(followers, (m) => m),
  rowsOf(friendRequests, (r) => r?.requester),
  rowsOf(suggestions, (s) => s?.profile),
  rowsOf(members, (m) => m?.profile),
]
const shownFollowers = computed(() => friendControls.apply(allRows()[0]))
const shownRequests = computed(() => friendControls.apply(allRows()[1]))
const shownSuggestions = computed(() => friendControls.apply(allRows()[2]))
const shownMembers = computed(() => friendControls.apply(allRows()[3]))
const shownCount = computed(() => shownFollowers.value.length + shownRequests.value.length
  + shownSuggestions.value.length + shownMembers.value.length)
const totalCount = computed(() => allRows().reduce((n, rows) => n + rows.length, 0))
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  await reloadData()
  loading.value = false
})
    
    definePageMeta({
        middleware: 'auth'
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

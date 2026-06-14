<template>
    <div>
        <v-alert v-if="contentStatusMessage" type="warning" variant="tonal" class="mb-4">
            {{ contentStatusMessage }}
            <template #append>
                <v-btn variant="text" @click="reloadContent">Retry</v-btn>
            </template>
        </v-alert>

		<section data-bs-version="5.1" class="info1 cid-v5A0K07pfT" id="info1-bd" data-sortbtn="btn-primary">
			<div class="mbr-overlay" style="opacity: 0.5; background-color: rgb(68, 121, 217);"></div>
			<div class="align-center container">
				<div class="row justify-content-center">
					<div class="col-12 col-lg-8">
						<h3 class="mbr-section-title mb-4 mbr-fonts-style display-1">
							<strong> {{ feedsPage?.name }}</strong>
						</h3>
						<p class="mbr-section-title mb-4 mbr-fonts-style display-7" v-dompurify-html="feedsPage?.content"></p>
					</div>
				</div>
			</div>
		</section>

        <v-card variant="text">
            <v-toolbar :style="`background-color: ${feedBar?.color}; color: ${feedBar?.colortext} !important`">
                <v-toolbar-title>{{ feedBar?.name }}</v-toolbar-title>


                <v-tabs v-model="tab" align-tabs="center">
                    <div v-for="(menu, index) in feedBar?.menus" :key="index">
                        <v-tab :value="menu?.value">
                            <v-btn variant="text"
                                :style="`color: ${feedBar?.colortext} !important`">{{ menu?.name }}</v-btn>
                        </v-tab>
                    </div>
                </v-tabs>
            </v-toolbar>
        </v-card>

        <v-tabs-window v-model="tab">
            <v-tabs-window-item :value="feedBar?.menus?.[0]?.value">
                <v-row class="media-container-row">
                    <template v-if="posts?.length">
                        <v-col class="wrap col-sm-12 col-lg-6 feedPost" v-for="post in posts" :key="post.id">
                            <postCard :post="post" />
                        </v-col>
                    </template>
                    <div class="center-text" v-else>No Activity yet</div>
                </v-row>
            </v-tabs-window-item>
            <v-tabs-window-item :value="feedBar?.menus?.[1]?.value">
                <v-row class="media-container-row">
                    <template v-if="posts?.length">
                        <v-col class="wrap col-sm-12 col-lg-6 feedPost" v-for="post in posts" :key="post.id">
                            <postCard :post="post" />
                        </v-col>
                    </template>
                    <div class="center-text" v-else>Not following anyone yet</div>
                </v-row>
            </v-tabs-window-item>
            <v-tabs-window-item :value="feedBar?.menus?.[2]?.value">
                <v-row class="media-container-row">
                    <v-col class="wrap col-sm-12 col-lg-6 feedPost" v-if="circles?.length" v-for="circlesPost in circles" :key="circlesPost.id">
                        <postCard :post="circlesPost?.posts_id" />
                    </v-col>

                    <div class="center-text" v-else>No Circles yet</div>
                </v-row>
            </v-tabs-window-item>
            <v-tabs-window-item :value="feedBar?.menus?.[3]?.value">
                <v-row class="media-container-row">
                    <template v-if="posts?.length">
                        <v-col class="wrap col-sm-12 col-lg-6 feedPost" v-for="post in posts" :key="post.id">
                            <postCard :post="post" />
                        </v-col>
                    </template>
                    <div class="center-text" v-else>No Activity yet</div>
                </v-row>
            </v-tabs-window-item>
        </v-tabs-window>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useInfiniteScroll } from '@vueuse/core'
import postCard from '../../components/related/post.vue'
import useConnectFeedsData from '../../composables/useConnectFeedsData'

const runtimeUseAuth = (globalThis as any).useAuth as (() => any) | undefined
const auth = runtimeUseAuth
  ? runtimeUseAuth()
  : {
      user: useState<any>('social:user', () => null),
      fetchSession: async () => null,
    }
const { user, fetchSession } = auth
void Promise.race([
  fetchSession(),
  new Promise((resolve) => setTimeout(resolve, 2500)),
]).catch(() => {})

const currentUserId = computed(() => (user.value as any)?.id || (user.value as any)?.userId || null)
const tab = ref(null)

const {
  feedBar,
  feedsPage,
  posts,
  circles,
  contentStatusMessage,
  reloadContent,
  loadMorePosts,
  loadMoreCircles,
} = useConnectFeedsData(currentUserId)

const { reset } = useInfiniteScroll(
  window,
  () => {
    if (tab.value === 'all' || tab.value === 'following' || tab.value === 'for-you') {
      loadMorePosts()
    } else if (tab.value === 'circles') {
      loadMoreCircles()
    }
  },
  {
    distance: 10,
    canLoadMore: () => {
      return true
    },
  }
)

useHead({
  title: 'Activity Feed',
})
</script>
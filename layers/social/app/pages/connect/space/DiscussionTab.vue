<template>
  <div>
    <div v-if="space?.posts && space.posts.length">
      <div class="text-center" v-for="(discussions, idx) in space.posts" :key="discussions?.posts_id?.id || idx">
        <row v-if="space?.space_type === 'Audio'">
          <v-col cols=12>
            <v-card>
            <videoPlayer :player="discussions?.post_id" />
            </v-card>
          </v-col>
        </row>

        <row v-if="space?.space_type === 'Video'">
          <v-col cols=12>
            <v-card>
            <videoPlayer :player="discussions?.post_id" />
            </v-card>
          </v-col>
        </row>

        <row v-if="space?.space_type === 'Text'">
          <v-col cols=12>
            <thoughtCard :thought="discussions?.post_id" />
          </v-col>
        </row> 

        <SpaceFeeds v-else :discussion="discussions?.posts_id" />
      </div>
    </div>
    
    <div class="center-text" v-else>
      <p>No discussions yet</p>
    </div>
  </div>
</template>
<script setup>
defineProps({ space: Object })
import SpaceFeeds from '#social/app/components/related/post.vue'
import thoughtCard from '../../../components/related/thought.vue'
</script>

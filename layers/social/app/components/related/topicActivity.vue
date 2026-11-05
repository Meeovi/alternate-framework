<template>
  <!-- Notes, public lists, events and spaces about a department's or
       category's topic (/api/social/topic). Sections with nothing are left out. -->
  <div ref="root" class="topicActivity">
    <v-sheet v-if="data?.notes?.length" class="topicSection">
      <v-toolbar :title="`Notes about ${data.topic.name}`" color="transparent" />
      <v-slide-group class="pa-4" show-arrows>
        <v-slide-group-item v-for="note in data.notes" :key="`${note.network || 'meeovi'}-${note.id}`">
          <postCard :post="note" class="ma-4 topicNote" />
        </v-slide-group-item>
      </v-slide-group>
    </v-sheet>

    <v-sheet v-if="data?.lists?.length" class="topicSection">
      <v-toolbar :title="`Lists about ${data.topic.name}`" color="transparent" />
      <v-slide-group class="pa-4" show-arrows>
        <v-slide-group-item v-for="list in data.lists" :key="list.id">
          <listCard :list="list" class="ma-4 topicCard" />
        </v-slide-group-item>
      </v-slide-group>
    </v-sheet>

    <v-sheet v-if="data?.events?.length" class="topicSection">
      <v-toolbar :title="`${data.topic.name} events`" color="transparent" />
      <v-slide-group class="pa-4" show-arrows>
        <v-slide-group-item v-for="item in data.events" :key="item.id">
          <v-card class="ma-4 topicCard" :href="item.url || item.tickets_url || undefined" target="_blank" rel="noopener">
            <v-img v-if="item.image" :src="getAssetURL(item.image)" :alt="item.name" height="160" cover />
            <v-card-title class="text-wrap">{{ item.name }}</v-card-title>
            <v-card-subtitle>
              <span v-if="eventDate(item)">{{ eventDate(item) }}</span>
              <span v-if="eventDate(item) && (item.location || item.type)"> · </span>
              <span>{{ item.location || item.type }}</span>
            </v-card-subtitle>
            <v-card-text v-if="item.description" class="topicEventText">{{ plain(item.description) }}</v-card-text>
          </v-card>
        </v-slide-group-item>
      </v-slide-group>
    </v-sheet>

    <v-sheet v-if="data?.spaces?.length" class="topicSection">
      <v-toolbar :title="`Spaces about ${data.topic.name}`" color="transparent" />
      <v-slide-group class="pa-4" show-arrows>
        <v-slide-group-item v-for="space in data.spaces" :key="space.id">
          <spaceCard :space="space" class="ma-4" />
        </v-slide-group-item>
      </v-slide-group>
    </v-sheet>
  </div>
</template>

<script setup>
  import { computed, ref, watch } from 'vue'
  import { useLazyFetch } from '#imports'
  import { useNearViewport } from '#shared/app/composables/useNearViewport'
  import { getAssetURL } from '#shared/app/utils/get-asset-url'
  import postCard from './post.vue'
  import listCard from './list.vue'
  import spaceCard from './space.vue'

  const props = defineProps({
    departmentId: { type: [Number, String], default: null },
    categoryId: { type: [Number, String], default: null },
  })

  const query = computed(() => (props.departmentId ? { department: props.departmentId } : { category: props.categoryId }))

  // Loaded in the browser once the visitor scrolls near it (it sits low on
  // the page, and searching Bluesky and the Fediverse can take a few seconds).
  const root = ref(null)
  const near = useNearViewport(root)
  const { data, execute } = useLazyFetch('/api/social/topic', {
    query,
    server: false,
    immediate: false,
    watch: false,
    key: computed(() => `topic-${props.departmentId ? 'd' : 'c'}-${props.departmentId || props.categoryId}`),
  })
  watch([near, query], ([isNear]) => {
    if (isNear && (props.departmentId || props.categoryId)) execute()
  })

  const eventDate = (item) => {
    const when = item.date || item.event_calendar
    return when ? new Date(when).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''
  }
  const plain = (html) => String(html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160)
</script>

<style scoped>
.topicSection {
  background-color: transparent;
  box-shadow: none;
}

.topicNote {
  width: 320px;
}

.topicCard {
  width: 280px;
}

.topicEventText {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

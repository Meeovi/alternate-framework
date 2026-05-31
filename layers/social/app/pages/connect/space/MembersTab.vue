<template>
  <div>
    <h5 class="center-text">{{ space?.name }} Administrators</h5>
    <v-row>
      <v-col cols="3">
        <membersList :member="space?.owner" />
      </v-col>
    </v-row>
    <h5 class="center-text">{{ space?.name }} Members</h5>
    <v-row>
      <v-col cols="3" v-if="space?.members?.length" v-for="members in space?.members" :key="members.id">
        <membersList :member="resolveUserRelation(members)" />
      </v-col>
      <div class="center-text" v-else>No Members yet</div>
    </v-row>
  </div>
</template>
<script setup>
defineProps({ space: Object })
import membersList from '#social/app/components/related/memberList.vue'
import { resolveUserRelation } from '#social/app/composables/content/socialMappers'
</script>

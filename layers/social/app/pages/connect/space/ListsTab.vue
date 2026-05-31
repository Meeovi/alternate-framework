<template>
  <div>
    <v-row>
      <v-col cols="3" v-if="space?.lists?.length" v-for="lists in space?.lists" :key="lists.id">
        <SpaceLists :list="lists?.lists_id" />
      </v-col>
      <div class="center-text" v-else>No Lists yet</div>
    </v-row>
  </div>
</template>
<script setup>
defineProps({ space: Object })
import SpaceLists from '#social/app/components/related/list.vue'
</script>

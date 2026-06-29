<!-- components/social/RepostGraph.vue -->
<template>
  <v-card class="pa-4">
    <v-card-title>Repost Network</v-card-title>
    <v-card-text>
      <div class="graph">
        <div
          v-for="node in nodes"
          :key="node.id"
          class="node"
          :style="{ left: node.x + '%', top: node.y + '%' }"
        >
          <v-avatar size="32">
            <img :src="node.avatar" alt="" />
          </v-avatar>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
const props = defineProps({
  nodes: {
    type: Array,
    default: () => [] // [{ id, avatar, x, y }]
  }
})
</script>

<style scoped>
.graph {
  position: relative;
  height: 260px;
  background: radial-gradient(circle, #1e1e1e, #000);
  border-radius: 12px;
}
.node {
  position: absolute;
  transform: translate(-50%, -50%);
}
</style>

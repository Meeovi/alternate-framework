<template>
  <div>
    <v-btn @click="handleAction">
      Send Event
    </v-btn>
  </div>
</template>

<script setup lang="ts">
const { proxy } = useScriptBingUet()

// noop in development, ssr
// just works in production, client
function handleAction() {
  proxy.uetq.push({ ec: 'conversion', ea: 'purchase', ev: 1 })
}
</script>
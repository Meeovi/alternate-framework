<template>
  <div>
    <v-expansion-panels variant="accordion">
      <v-expansion-panel :title="social?.name" expand-icon="fas fa-plus" collapse-icon="fas fa-minus" elevation="0">
        <v-expansion-panel-text>
          <v-list v-for="child in social?.menus" :key="child.id" class="ml-4">
            <v-list-item :title="child.name" :value="child.name" :href="`${child.slug}`">
            </v-list-item>
          </v-list>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script setup>
const { $sdk } = useNuxtApp()

const { data: social } = await useAsyncData('social', async () => {
    const item = await $sdk.content.getItem('navigation', '76')
    return item || { name: '', menus: [] }
})
</script>
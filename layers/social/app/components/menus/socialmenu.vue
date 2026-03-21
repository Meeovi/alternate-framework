<template>
  <div>
    <v-expansion-panels variant="accordion">
      <v-expansion-panel :title="social?.name" expand-icon="fas:fa fa-plus" collapse-icon="fas:fa fa-minus" elevation="0">
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
const { $directus, $readItem } = useNuxtApp()
const route = useRoute()

const { data: social } = await useAsyncData('social', () => {
  return $directus.request($readItem('navigation', '76'))
})
</script>
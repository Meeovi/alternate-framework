<template>
  <div>
    <v-expansion-panels variant="accordion">
      <v-expansion-panel title="Outlets" expand-icon="fas:fa fa-plus" collapse-icon="fas:fa fa-minus" elevation="0">
        <v-expansion-panel-text>
          <v-list v-for="child in outlets" :key="child.id" class="ml-4">
            <v-list-item :title="child.name" :value="child.name" :href="`/outlets/${child.slug}`">
            </v-list-item>
          </v-list>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script setup>
  const {
    $directus,
    $readItems
  } = useNuxtApp()
  
  const {
    data: outlets
  } = await useAsyncData('outlets', () => {
    return $directus.request($readItems('departments', {
      filter: {
        active: {
          _eq: 'active'
        },
        type: {
          _eq: 'outlets'
        }
      },
      fields: ['*', {
        '*': ['*']
      }],
      sort: ['name']
    }))
  })
</script>
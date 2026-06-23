<template>
  <div>
    <v-expansion-panels variant="accordion">
      <v-expansion-panel title="Outlets" expand-icon="fas fa-plus" collapse-icon="fas fa-minus" elevation="0">
        <v-expansion-panel-text>
          <v-list class="ml-4">
            <v-list-item v-for="child in outletsMenu" :key="child.id" :title="child.name" :value="child.name" :href="`/departments/${child.slug}`">
            </v-list-item>
            <v-list-item style="width: 100%;"><v-btn title="Browse All Outlets" text="Browse All Outlets" href="/outlets"></v-btn></v-list-item>
          </v-list>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script setup>
  import { computed } from '#imports'

  const { $sdk } = useNuxtApp()

  const {
    data: outletsMenuRaw
  } = await useAsyncData('outletsMenu', async () => {
    const rows = await $sdk.content.readItems('departments', {
      filter: {
        active: {
          _eq: 'active'
        },
        type: {
          _eq: 'outlet'
        }
      },
      fields: ['*', {
        '*': ['*']
      }],
      sort: ['name']
    })
    const result = Array.isArray(rows) ? rows : []
    if (result.length) return result

    return await $sdk.content.readItems('departments', {
      filter: {
        type: {
          _eq: 'outlet'
        }
      },
      fields: ['*', {
        '*': ['*']
      }],
      sort: ['name']
    })
  })

  const outletsMenu = computed(() => {
    const value = outletsMenuRaw.value
    if (Array.isArray(value)) return value
    return []
  })
</script>
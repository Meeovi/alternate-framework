<template>
  <div>
    <v-expansion-panels variant="accordion">
      <v-expansion-panel title="Departments" expand-icon="fas fa-plus" collapse-icon="fas fa-minus" elevation="0">
        <v-expansion-panel-text>
          <v-list v-for="child in departmentsMenu" :key="child.id" class="ml-4">
            <v-list-item :title="child.name" :value="child.name" :href="`/departments/${child.slug}`">
            </v-list-item>
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
    data: departmentsMenuRaw
  } = await useAsyncData('departmentsMenu', async () => {
    const rows = await $sdk.content.readItems('departments', {
      filter: {
        active: {
          _eq: 'active'
        },
        type: {
          _eq: 'department'
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
          _eq: 'department'
        }
      },
      fields: ['*', {
        '*': ['*']
      }],
      sort: ['name']
    })
  })

  const departmentsMenu = computed(() => {
    const value = departmentsMenuRaw.value
    if (Array.isArray(value)) return value
    return []
  })
</script>
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
  import {
    useAppGateway
  } from '../../composables/useAppGateway'

  const gateway = useAppGateway()
  const content = gateway.content

  const {
    data: departmentsMenu
  } = await useAsyncData('departmentsMenu', () => {
    return content.readItems('departments', {
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
  })
</script>
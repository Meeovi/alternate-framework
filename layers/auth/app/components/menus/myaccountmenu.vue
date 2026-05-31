<template>
  <div>
    <v-expansion-panels variant="accordion">
      <v-expansion-panel :title="navAccount?.name" expand-icon="fas fa-plus" collapse-icon="fas fa-minus" elevation="0">
        <v-expansion-panel-text>
          <v-list v-for="item in navAccount?.menus" :key="item">
            <v-list-item :title="item?.name" :value="item?.name" :prepend-icon="item?.icon" :href="item?.url">
            </v-list-item>
          </v-list>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script setup>
import useContent from '#shared/app/composables/content/useContent'
const content = useContent()

const { data: navAccount } = await useAsyncData('auth-myaccount-nav-account', () => {
  return content.readItem('navigation', '2')
})
</script>

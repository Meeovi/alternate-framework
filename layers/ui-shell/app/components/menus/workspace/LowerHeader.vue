<template>
  <div class="lowerBar d-flex justify-space-around">
    <v-toolbar color="white">
        <v-toolbar-title>
          Meeovi Workspace
        </v-toolbar-title>

        <v-toolbar-items>

    <!-- Sales Menu -->
    <v-menu>
      <template v-slot:activator="{ props }">
        <v-btn
          color="primary"
          v-bind="props"
          :text="salesMenu?.name"
        >
        </v-btn>
      </template>
      <v-list>
        <v-list-item
          v-for="(item, index) in salesMenu?.menus"
          :key="index"
          :value="index"
        >
          <NuxtLink :to="item.url">
            <v-list-item-title>{{ item.name }}</v-list-item-title>
          </NuxtLink>
        </v-list-item>
      </v-list>
    </v-menu>

    <!-- Catalog Menu -->
    <v-menu>
      <template v-slot:activator="{ props }">
        <v-btn
          color="primary"
          v-bind="props"
          :text="catalogMenu?.name"
        >
        </v-btn>
      </template>
      <v-list>
        <v-list-item
          v-for="(item, index) in catalogMenu?.menus"
          :key="index"
          :value="index"
        >
          <NuxtLink :to="item.url">
            <v-list-item-title>{{ item.name }}</v-list-item-title>
          </NuxtLink>
        </v-list-item>
      </v-list>
    </v-menu>

    <!-- Customers Menu -->
    <v-menu>
      <template v-slot:activator="{ props }">
        <v-btn
          color="primary"
          v-bind="props"
          :text="customersMenu?.name"
        >
        </v-btn>
      </template>
      <v-list>
        <v-list-item
          v-for="(item, index) in customersMenu?.menus"
          :key="index"
          :value="index"
        >
          <NuxtLink :to="item.url">
            <v-list-item-title>{{ item.name }}</v-list-item-title>
          </NuxtLink>
        </v-list-item>
      </v-list>
    </v-menu>

    <!-- Marketing Menu -->
    <v-menu>
      <template v-slot:activator="{ props }">
        <v-btn
          color="primary"
          v-bind="props"
          :text="marketingMenu?.name"
        >
        </v-btn>
      </template>
      <v-list>
        <v-list-item
          v-for="(item, index) in marketingMenu?.menus"
          :key="index"
          :value="index"
        >
          <NuxtLink :to="item.url">
            <v-list-item-title>{{ item.name }}</v-list-item-title>
          </NuxtLink>
        </v-list-item>
      </v-list>
    </v-menu>

    <!-- Content Menu -->
    <v-menu>
      <template v-slot:activator="{ props }">
        <v-btn
          color="primary"
          v-bind="props"
          :text="contentMenu?.name"
        >
        </v-btn>
      </template>
      <v-list>
        <v-list-item
          v-for="(item, index) in contentMenu?.menus"
          :key="index"
          :value="index"
        >
          <NuxtLink :to="item.url">
            <v-list-item-title>{{ item.name }}</v-list-item-title>
          </NuxtLink>
        </v-list-item>
      </v-list>
    </v-menu>

    <!-- Reports Menu -->
    <v-menu>
      <template v-slot:activator="{ props }">
        <v-btn
          color="primary"
          v-bind="props"
          :text="reportsMenu?.name"
        >
        </v-btn>
      </template>
      <v-list>
        <v-list-item
          v-for="(item, index) in reportsMenu?.menus"
          :key="index"
          :value="index"
        >
          <NuxtLink :to="item.url">
            <v-list-item-title>{{ item.name }}</v-list-item-title>
          </NuxtLink>
        </v-list-item>
      </v-list>
    </v-menu>

    <!-- Stores Menu -->
    <v-menu>
      <template v-slot:activator="{ props }">
        <v-btn
          color="primary"
          v-bind="props"
          :text="storesMenu?.name"
        >
        </v-btn>
      </template>
      <v-list>
        <v-list-item
          v-for="(item, index) in storesMenu?.menus"
          :key="index"
          :value="index"
        >
          <NuxtLink :to="item.url">
            <v-list-item-title>{{ item.name }}</v-list-item-title>
          </NuxtLink>
        </v-list-item>
      </v-list>
    </v-menu>
        </v-toolbar-items>
    </v-toolbar>
  </div>
</template>

<script setup>
    const {
        $directus,
        $readItem,
    } = useNuxtApp()

    const {
        data: salesMenu
    } = useAsyncData('salesMenu', () => {
        return $directus.request($readItem('navigation', '139'))
    }, { lazy: true })

    const {
        data: catalogMenu
    } = useAsyncData('catalogMenu', () => {
        return $directus.request($readItem('navigation', '140'))
    }, { lazy: true })

    const {
        data: customersMenu
    } = useAsyncData('customersMenu', () => {
        return $directus.request($readItem('navigation', '141'))
    }, { lazy: true })

    const {
        data: marketingMenu
    } = useAsyncData('marketingMenu', () => {
        return $directus.request($readItem('navigation', '142'))
    }, { lazy: true })

    const {
        data: contentMenu
    } = useAsyncData('contentMenu', () => {
        return $directus.request($readItem('navigation', '143'))
    }, { lazy: true })

    const {
        data: reportsMenu
    } = useAsyncData('reportsMenu', () => {
        return $directus.request($readItem('navigation', '144'))
    }, { lazy: true })

    const {
        data: storesMenu
    } = useAsyncData('storesMenu', () => {
        return $directus.request($readItem('navigation', '145'))
    }, { lazy: true })
</script>
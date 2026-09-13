<template>
  <v-footer class="d-flex align-center justify-center ga-2 flex-wrap flex-grow-1 py-3">
    <v-btn v-for="link in links?.menus" :key="link" :text="link?.name" :href="link?.url" variant="text" rounded></v-btn>

    <div class="flex-1-0-100 text-center mt-2">
      <p class="mbr-text mb-0 mbr-fonts-style display-7" style="width: 100%; text-align: center;">
        {{ blocksCopyright?.content?.[0]?.subtitle }} {{ new Date().getFullYear() }}&nbsp;<NuxtLink
          :to="blocksCopyright?.content?.[0]?.url">{{ blocksCopyright?.name }}&nbsp;&nbsp;</NuxtLink>
        {{ blocksCopyright?.content?.[0]?.name }}
      </p>
    </div>
  </v-footer>
</template>

<script setup>
  const {
    $directus,
    $readItem,
  } = useNuxtApp()

  const {
    data: links
  } = await useAsyncData('links', async () => {
    const resp = await $directus.request($readItem('navigation', '132'))
    return resp?.data || resp || {}
  })

  const {
    data: blocksCopyright
  } = await useAsyncData('blocksCopyright', async () => {
    const result = await $directus.request($readItem('page_blocks', '5', {
      fields: ['*', 'media.*.*'],
    }))
    return result?.data || result || {}
  })
</script>

<style scoped>
.v-footer {
  position: fixed;
  bottom: 0px;
  width: 100%;
  background-color: transparent !important;
}
</style>
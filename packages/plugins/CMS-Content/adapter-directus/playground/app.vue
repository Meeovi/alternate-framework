<template>
    <h1>Blog</h1>
    <ul>
        <li v-for="post in posts" :key="post.id">
            <NuxtLink :href="`/${post.slug}`">
                <h2>{{ post.title }}</h2>
            </NuxtLink>
        </li>
    </ul>
</template>

<script setup>
const { $directus, $readItems } = useNuxtApp()

const posts = await useAsyncData('posts', () => {
  return $directus.request($readItems('posts'))
})
</script>

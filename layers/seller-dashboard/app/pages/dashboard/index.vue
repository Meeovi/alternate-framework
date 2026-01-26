<template v-if="profile.role === 'seller'">
    <div>

    </div>
</template>

<script setup>
    
    definePageMeta({
        middleware: ['seller']
    })

    useHead({
        title: "Seller Dashboard - Meeovi"
    })
</script>
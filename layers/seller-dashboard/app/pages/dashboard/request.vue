<template>
    <div v-if="!user.isSeller">
        <p>Your seller account is pending approval.</p>
        <v-btn v-if="!user.profile?.seller_requested" @click="requestSeller">
            Request Seller Access
        </v-btn>
    </div>
</template>

<script setup>
    const user = useUserStore()

    const requestSeller = async () => {
        await $fetch('/api/seller/request', {
            method: 'POST'
        })
    }
</script>
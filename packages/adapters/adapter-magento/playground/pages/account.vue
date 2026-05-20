<script setup>
const customerAuth = useMagentoCustomerAuth()

async function login() {
  await customerAuth.signIn('john@example.com', 'password123')
}

async function logout() {
  await customerAuth.signOut()
}
</script>

<template>
  <div>
    <h1>Account</h1>

    <button @click="login">Sign In</button>
    <button @click="logout">Sign Out</button>

    <pre>{{ customerAuth.customer }}</pre>
  </div>
</template>

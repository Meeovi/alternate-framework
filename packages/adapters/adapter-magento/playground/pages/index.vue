<script setup>
const { list } = useMagentoProducts()
const products = await list({ page: 1, pageSize: 10 })
</script>

<template>
  <div>
    <h1>Magento Playground</h1>
    <NuxtLink to="/products">Products</NuxtLink>
    <NuxtLink to="/cart">Cart</NuxtLink>
    <NuxtLink to="/account">Account</NuxtLink>

    <h2>Featured Products</h2>
    <pre>{{ products }}</pre>
  </div>
</template>

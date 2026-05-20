<script setup>
const { list } = useMagentoProducts()
const products = await list({ page: 1, pageSize: 20 })
</script>

<template>
  <div>
    <h1>Products</h1>
    <pre>{{ products }}</pre>
  </div>
</template>

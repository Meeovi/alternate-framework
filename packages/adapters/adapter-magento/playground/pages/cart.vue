<script setup>
const cart = useMagentoCart()

await cart.create()
await cart.addItem('TSHIRT-RED', 1)

const current = await cart.get()
</script>

<template>
  <div>
    <h1>Your Cart</h1>
    <pre>{{ current }}</pre>
  </div>
</template>

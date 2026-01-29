<template>
  <div class="seller-dashboard">
    <h1>Seller Dashboard</h1>
    <nav>
      <ul>
        <li><NuxtLink to="/seller-dashboard/products">Products</NuxtLink></li>
        <li><NuxtLink to="/seller-dashboard/orders">Orders</NuxtLink></li>
        <li><NuxtLink to="/seller-dashboard/reviews">Reviews</NuxtLink></li>
        <li><NuxtLink to="/seller-dashboard/shops">Shops</NuxtLink></li>
        <li><NuxtLink to="/seller-dashboard/shipments">Shipments</NuxtLink></li>
      </ul>
    </nav>
    <section>
      <p>Use the links to manage your store. Backend adapters (e.g. adapter-magento) can register at runtime.</p>
    </section>
  </div>
</template>

<script setup>
</script>

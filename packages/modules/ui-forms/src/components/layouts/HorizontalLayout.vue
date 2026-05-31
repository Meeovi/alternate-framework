<template>
  <div class="horizontal-layout">
    <slot />
  </div>
</template>

<style scoped>
.horizontal-layout { display: flex; gap: 1rem; flex-wrap: wrap; }
</style>

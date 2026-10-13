<template>
  <div class="logo">
    <NuxtLink to="/workspace" class="workspace-logo">
      <img src="../../../assets/workspace/meeovi-logo.png" alt="Meeovi" width="36" height="36">
      <span class="workspace-logo__text">
        <span class="workspace-logo__name">Meeovi</span>
        <span class="workspace-logo__sub">Workspace</span>
      </span>
    </NuxtLink>
  </div>
</template>

<style>
.workspace-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  white-space: nowrap;
}
/* Fixed size: apps with a global `img { width: 100% }` (meeovi-frontend)
   would otherwise blow the mark up to the image's full width. */
.workspace-logo img {
  flex: 0 0 36px;
  width: 36px;
  height: 36px;
}
.workspace-logo__text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}
.workspace-logo__name {
  font-size: 1.25rem;
  font-weight: 700;
  color: rgb(var(--v-theme-darkText));
}
.workspace-logo__sub {
  font-size: 0.75rem;
  font-weight: 500;
  color: rgb(var(--v-theme-lightText));
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
</style>

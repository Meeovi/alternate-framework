<template>
  <div class="contentPage wishlistPage">
    <h1>Your Wishlist</h1>

    <div class="empty">
      Nothing saved yet — tap the heart on any product to add it here.
      <div class="mt-4">
        <v-btn variant="text" to="/lists" text="Go to your lists" />
      </div>
    </div>
  </div>
</template>

<script setup>
  import { onMounted } from 'vue'
  import { useWishlistStore } from '../stores/wishlist/useWishlistStore'

  // The wishlist is a list of type "Wishlist" (layers/social): this page
  // opens it at /lists/list/<slug>. Until the first product is saved there
  // is no list yet, so it shows the empty state.
  const requestFetch = useRequestFetch()
  const { data } = await useAsyncData('wishlist', () => requestFetch('/api/social/wishlist').catch(() => null))
  if (data.value?.list?.slug) {
    await navigateTo(`/lists/list/${data.value.list.slug}`, { replace: true })
  }

  // Products saved in this browser before signing in move into the list
  // here; open it once they have.
  const wishlistStore = useWishlistStore()
  onMounted(async () => {
    await wishlistStore.load(true)
    if (wishlistStore.listSlug) await navigateTo(`/lists/list/${wishlistStore.listSlug}`, { replace: true })
  })

  useHead({
    title: 'Your Wishlist'
  })
</script>

<style scoped>
  .wishlistPage {
    padding: 24px 16px;
  }

  .empty {
    color: #666;
    padding: 40px 0;
    text-align: center;
  }
</style>

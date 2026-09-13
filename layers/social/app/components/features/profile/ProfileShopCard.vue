<template>
  <ProfileSectionCard title="Shop">
    <template #title-append>
      <v-btn size="small" variant="text" to="/shops">Open Shop Hub</v-btn>
    </template>

    <ProfileEntityList
      :items="shops"
      :available="available"
      :message="message"
      icon="fas fa-store"
      :limit="3"
      :title-keys="['name']"
      :subtitle-keys="['slug', 'date_created']"
      :key-keys="['id', 'slug', 'name']"
      title-prefix="Shop #"
      :to="shopLink"
    />

    <v-btn
      v-if="!(available && shops.length)"
      class="mt-3"
      color="primary"
      prepend-icon="fas fa-store"
      to="/shops"
    >
      Create / Manage Shop
    </v-btn>
  </ProfileSectionCard>
</template>

<script setup>
import ProfileSectionCard from './ProfileSectionCard.vue'
import ProfileEntityList from './ProfileEntityList.vue'

defineProps({
  shops: { type: Array, default: () => [] },
  available: { type: Boolean, default: false },
  message: { type: String, default: '' },
})

const shopLink = (shop) => (shop?.slug ? `/shop/${shop.slug}` : '/shops')
</script>

<template>
  <ProfileSectionCard title="Gift Cards" status :available="available">
    <div class="d-flex ga-2 mb-3">
      <v-btn variant="outlined" prepend-icon="fas fa-gift" to="/product/showcases">Browse Gift Cards</v-btn>
    </div>

    <ProfileEntityList
      :items="giftCards"
      :available="available"
      :message="message"
      icon="fas fa-gift"
      :title-keys="['code']"
      :subtitle-keys="['balanceLabel', 'balance']"
      :key-keys="['code', 'id']"
      title-prefix="Gift Card "
      :to="() => '/product/showcases'"
    />
  </ProfileSectionCard>
</template>

<script setup>
import ProfileSectionCard from './ProfileSectionCard.vue'
import ProfileEntityList from './ProfileEntityList.vue'

defineProps({
  giftCards: { type: Array, default: () => [] },
  available: { type: Boolean, default: false },
  message: { type: String, default: '' },
})
</script>

<template>
  <ProfileSectionCard title="Subscriptions" status :available="available">
    <div class="d-flex ga-2 mb-3">
      <v-btn variant="outlined" prepend-icon="fas fa-repeat" to="/product/showcases">View Plans</v-btn>
    </div>

    <ProfileEntityList
      :items="subscriptions"
      :available="available"
      :message="message"
      icon="fas fa-repeat"
      :title-keys="['name', 'plan']"
      :subtitle-keys="['status']"
      :key-keys="['id', 'reference']"
      title-prefix="Subscription #"
      :to="subscriptionLink"
    />
  </ProfileSectionCard>
</template>

<script setup>
import ProfileSectionCard from './ProfileSectionCard.vue'
import ProfileEntityList from './ProfileEntityList.vue'

defineProps({
  subscriptions: { type: Array, default: () => [] },
  available: { type: Boolean, default: false },
  message: { type: String, default: '' },
})

const subscriptionLink = (sub) => (sub?.id ? `/subscription/${sub.id}` : '/product/showcases')
</script>

<template>
  <v-card>
    <v-card-title>About {{ displayName }}</v-card-title>
    <v-card-text>
      <v-list lines="two" density="comfortable">
        <v-list-item title="Full Name" :subtitle="displayName" prepend-icon="fas fa-id-badge" />
        <v-list-item title="Email" :subtitle="email" prepend-icon="fas fa-envelope" />
        <v-list-item title="Role" :subtitle="role" prepend-icon="fas fa-shield" />
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script setup>
defineProps({
  displayName: { type: String, default: '' },
  email: { type: String, default: '' },
  role: { type: String, default: '' },
})
</script>

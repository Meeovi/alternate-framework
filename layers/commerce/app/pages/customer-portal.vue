<template>
  <section class="py-16">
    <div class="container mx-auto px-4">
      <div class="max-w-2xl mx-auto text-center">
        <h1 class="text-4xl font-heading font-bold text-primary mb-6">Customer Portal</h1>
        <p class="text-xl text-muted-foreground mb-8">Access your purchases and manage your account</p>
        <div class="bg-card border border-border rounded-lg p-6">
          <button
            type="button"
            class="w-full px-6 py-3 bg-gray-200 text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
            @click="accessPortal"
          >
            Access Portal
          </button>
          <p class="text-sm text-muted-foreground mt-4">You'll be redirected to your secure customer portal</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// The customer id is resolved server-side from the authenticated session —
// this page never sends an email or customer id as a trusted parameter.
// A plain navigation is used (not $fetch) so the browser follows the
// server's redirect to the hosted Polar portal URL. An unauthenticated
// visitor gets a 401 from the endpoint itself.
const accessPortal = () => {
  window.location.href = '/api/customer-portal'
}
</script>
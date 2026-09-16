<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    <v-toolbar color="white">
      <v-toolbar-title>Shop Profile</v-toolbar-title>

      <v-toolbar-items class="d-flex align-center pr-4">
        <v-chip v-if="profile" :color="profile.isApproved ? 'success' : 'warning'" size="small" class="mr-2">
          {{ profile.isApproved ? 'Approved' : 'Pending approval' }}
        </v-chip>
      </v-toolbar-items>
    </v-toolbar>

    <div class="contentSection">
      <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mb-4">
        Couldn't load your shop profile.
      </v-alert>

      <div v-if="pending" class="d-flex justify-center align-center" style="height: 200px;">
        <v-progress-circular indeterminate color="primary" size="32" />
      </div>

      <!-- Catches a client-side render crash in the form itself, separate
           from the fetch-failure `error` above — see SellerDataGrid.vue's
           own comment on the same pattern for why. -->
      <NuxtErrorBoundary v-else-if="form">
        <v-form @submit.prevent="submit">
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field v-model="form.shopName" label="Shop Name" />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model="form.shopUrl" label="Shop URL Slug" prefix="/marketplace/" />
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field v-model="form.bannerUrl" label="Banner Image URL" />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model="form.logoUrl" label="Logo Image URL" />
            </v-col>

            <v-col cols="12">
              <v-textarea v-model="form.metaDescription" label="Meta Description" rows="2" />
            </v-col>

            <v-col cols="12" sm="6">
              <v-textarea v-model="form.shippingPolicy" label="Shipping Policy" rows="3" />
            </v-col>
            <v-col cols="12" sm="6">
              <v-textarea v-model="form.returnPolicy" label="Return Policy" rows="3" />
            </v-col>

            <v-col cols="12" sm="4">
              <v-text-field v-model="form.socialLinks.facebook" label="Facebook URL" />
            </v-col>
            <v-col cols="12" sm="4">
              <v-text-field v-model="form.socialLinks.twitter" label="Twitter/X URL" />
            </v-col>
            <v-col cols="12" sm="4">
              <v-text-field v-model="form.socialLinks.instagram" label="Instagram URL" />
            </v-col>
          </v-row>

          <v-alert v-if="saveError" type="error" variant="tonal" density="compact" class="mb-3">
            Couldn't save your shop profile.
          </v-alert>
          <v-alert v-if="saved" type="success" variant="tonal" density="compact" class="mb-3">
            Shop profile saved.
          </v-alert>

          <v-btn type="submit" color="primary" :loading="saving">Save</v-btn>
        </v-form>

        <template #error="{ clearError }">
          <v-alert type="warning" variant="tonal" density="compact">
            The shop profile form isn't working right now.
            <v-btn size="small" variant="text" class="ml-2" @click="clearError">Retry</v-btn>
          </v-alert>
        </template>
      </NuxtErrorBoundary>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useSellerShop } from '~/composables/dashboard/useSellerShop'

definePageMeta({ middleware: 'seller' })
useHead({
  title: 'Shop Profile',
  meta: [
    {
      name: 'description',
      content: 'Manage your marketplace shop name, banner, policies and social links.'
    }
  ]
})

const { profile, pending, error, saving, saveError, saved, save } = useSellerShop()

/**
 * A mutable draft, lazily copied from `profile` on first read. Not a
 * `watch(profile, ..., { immediate: true })` — that derivation is
 * unreliable under SSR: Vue's watcher scheduling isn't guaranteed to
 * flush before Nuxt captures the render, so `draft` could still be null
 * on the very render where `profile` itself is already populated (which
 * is why the toolbar's `profile.isApproved` chip could show correctly
 * while the form below stayed empty — confirmed live 2026-09-15). A
 * `computed` evaluates synchronously on access, so it can't go stale.
 */
const draft = ref(null)
const form = computed(() => {
  if (!draft.value && profile.value) {
    draft.value = { ...profile.value, socialLinks: { ...profile.value.socialLinks } }
  }
  return draft.value
})

async function submit() {
  if (!form.value) return
  await save(form.value)
}
</script>

<template>
  <div>
    <section data-bs-version="5.1" class="people5 cid-uHg5WZJiwK" id="people5-au">
      <div class="container-fluid">
        <div class="row justify-content-between">
          <div class="col-12 col-lg-12">
            <div>
              <div class="shadow">
                <img v-if="!userProfile?.image" :src="userProfile?.image || undefined" :alt="userProfile?.name" class="align">
                <img v-else src="https://via.placeholder.com/200" :alt="userProfile?.name" class="align">
                <h5 class="card-title mbr-fonts-style display-2">
                  <strong>{{ userProfile?.name }}</strong>
                </h5>
                <h5 class="card-subtitle mbr-fonts-style display-4">
                  {{ userProfile?.profession }}</h5>
                <NuxtLink v-if="userProfile?.isSeller" :to="`/spaces/${userProfile?.spaces?.space_id?.slug}`"
                  class="card-text mbr-fonts-style display-4"></NuxtLink>
                <p class="card-text mbr-fonts-style display-4" v-dompurify-html="userProfile?.description"></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <v-sheet>
      <v-tabs color="primary" center-active>
        <v-tab value="one">Feed</v-tab>
        <v-tab value="two">Vibez</v-tab>
        <v-tab value="three" v-if="userProfile?.isSeller">Shop</v-tab>
        <v-tab value="four">Links</v-tab>
      </v-tabs>

      <v-divider></v-divider>

      <v-tabs-window v-model="tab">
        <v-tabs-window-item value="one">
          <v-sheet class="pa-5" color="purple">One</v-sheet>
        </v-tabs-window-item>
        <v-tabs-window-item value="two">
          <v-sheet class="pa-5" color="orange">Two</v-sheet>
        </v-tabs-window-item>
        <v-tabs-window-item value="three">
          <v-sheet class="pa-5" color="brown">Three</v-sheet>
        </v-tabs-window-item>
        <v-tabs-window-item value="four">
          <v-sheet class="pa-5" color="green">Four</v-sheet>
        </v-tabs-window-item>
      </v-tabs-window>
    </v-sheet>
  </div>
</template>

<script setup lang="ts">
  import {
    useAuth,
    useAsyncData,
    useHead
  } from '#imports';
  import { useLocate } from 'alternate-gateway/locate/adapters/vue/composable'
  import {
    computed,
    onMounted,
    ref
  } from '#imports';
  import {
    useRoute
  } from 'vue-router';

  const route = useRoute();
  const tab = ref(null);
  const {
    user,
    client
  } = useAuth()
  const userProfile = computed(() => user?.value as any)
  const alert = useAlert()
  const {
    t
  } = useLocate()
  const {
    data: accounts
  } = await useAsyncData < any > ('/accounts', () => (client as any).listAccounts?.() ?? [])

  function hasProvider(provider: string) {
    const list = (accounts.value as any)?.data ?? (accounts.value as any)
    return list?.some((account: {
      provider: string
    }) => account.provider === provider)
  }

  const error = useRoute().query?.error
  onMounted(() => {
    if (error) {
      alert.error(String(error))
    }
  })

  useHead({
    title: userProfile.value?.username || userProfile.value?.name || 'User Profile',
  })
</script>
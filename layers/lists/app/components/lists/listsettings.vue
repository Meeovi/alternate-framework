<template>
  <div>
      <UCard elevation="0">
          <v-toolbar title="Update A List"></v-toolbar>
          <v-form @submit.prevent="createList">
              <v-container>
                  <v-row>
                      <v-col cols="6">
                          <UInput v-model="title" label="List Name" required></UInput>
                      </v-col>
                      <v-col cols="6">
                          <v-combobox v-model="type" label="Type" :items="['List', 'Registry', 'Playlist', 'Todo']"></v-combobox>
                      </v-col>
                      <v-col cols="12">
                          <UFileUpload clearable label="List Image"></UFileUpload>
                      </v-col>
                      <v-col cols="12">
                          <UTextarea v-model="description" label="List Description"></UTextarea>
                      </v-col>
                      <v-col cols="12">
                          <UCard title="Choose a Product for your List">
                              <template #header>
                                  <UInput density="compact" variant="solo" label="Search Meeovi for products"
                                      append-inner-icon="fas:fa fa-search" single-line hide-details
                                      @click:append-inner="onClick"></UInput>
                                  <v-spacer></v-spacer>
                                  <div class="d-flex pa-4">
                                      <UCheckbox-btn v-model="includeFiles" class="pe-2" color="orange">
                                      </UCheckbox-btn>
                                      <!--<NuxtLink :to="`/product/${products.id}`">
                                      <UCard class="ma-4" height="580" width="250" @click="toggle">
                                          <NuxtImg loading="lazy" class="align-end text-white" height="280"
                                              :src="`${products.featuredAsset.preview}`" :alt="products.name" cover />

                                          <UCard-title class="pt-4">
                                              {{ products.name }}
                                          </template>

                                          <template #header>
                                              <div>Sku: {{ products.variants.sku }}</div>
                                          </template>

                                          <template>
                                              <template #header>$ {{ products.variants.price }}
                                              </template>
                                          </template>
                                          <div class="d-flex fill-height align-center justify-center">
                                              <v-scale-transition>
                                                  <UIcon v-if="isSelected" color="white" size="48"
                                                      icon="mdi-close-circle-outline"></UIcon>
                                              </v-scale-transition>
                                          </div>
                                      </UCard>
                                  </NuxtLink>-->
                                  </div>
                              </template>
                          </UCard>
                      </v-col>
                  </v-row>
              </v-container>

              <v-divider class="mt-12"></v-divider>
              <template>
                  <UButton color="blue-darken-1" variant="text" type="submit" @click="reset = false">
                      Delete
                  </UButton>
                  <v-spacer></v-spacer>
                  <UButton color="blue-darken-1" variant="text" type="submit">
                      Update
                  </UButton>
              </template>
          </v-form>
      </UCard>
  </div>
</template>

<script setup>
  import {
      ref
  } from 'vue'
    const content = useContentAdapter()
  

  const config = useRuntimeConfig();
  const dialog = ref(false);
  const includeFiles = ref(true);
  const enabled = ref(false);
  const title = ref('');
  const acf = ref('');
  const ispublic = ref('');
  const description = ref('');
  const type = ref('');
  const products = ref('');
  const owner = ref('');
  const image = ref('');
  const errorMessage = ref('');
  const successMessage = ref('');

  const updatelist = async () => {
      try {
          const response = await $fetch(`${config.apiUrl}/wp-json/wp/v2/list`, {
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${config.wordpressToken}`
              },
              body: JSON.stringify({
                  title: title.value,
                  ispublic: ispublic.value,
                  description: description.value,
                  image: image.value,
                  type: type.value,
                  products: products.value,
                  owner: owner.value,
                  status: 'publish',
              })
          })

          console.log(response);

          if (response.id) {
              successMessage.value = 'List updated successfully!'
              errorMessage.value = ''
          } else {
              throw new Error('Failed to update list')
          }
      } catch (error) {
          console.error('Error updating list:', error);
          if (error.response) {
              console.error('Error response:', error.response);
              if (error.response.status === 403) {
                  errorMessage.value = 'You do not have permission to update a list.'
              } else {
                  errorMessage.value = `Error: ${error.response.status} ${error.response.statusText}`
              }
          } else {
              errorMessage.value = error.message
          }
          successMessage.value = ''
      }
  }

  useHead({
      title: 'Update List',
  })
</script>
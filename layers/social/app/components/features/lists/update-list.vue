<template>
    <div>
        <v-row justify="center">
            <v-card>
                <v-form @submit.prevent="handleSubmit">
                    <v-toolbar dark color="primary">
                        <v-btn icon dark @click="dialog = false">
                            <v-icon icon="fas fa-circle-xmark"></v-icon>
                        </v-btn>
                        <template>
                            <span class="text-h6">Create a new Space</span>
                        </template>
                    </v-toolbar>
                    <template>
                        <v-container>
                            <v-row>
                                <v-col cols="12">
                                    <v-text-field v-model="listData.name" label="List Name" required></v-text-field>
                                </v-col>
                                <v-col cols="6">
                                    <v-select v-model="listData.type" label="Type"
                                        :items="['List', 'Registry', 'Playlist', 'Todo']"></v-select>
                                </v-col>
                                <v-col cols="6">
                                    <v-select v-model="listData.status" label="Status"
                                        :items="['Public', 'Private']"></v-select>
                                </v-col>
                                <v-col cols="12">
                                    <v-file-upload @change="handleImageUpload" clearable
                                        density="compact" prepend-icon="fas fa-image" accept="image/*"
                                        label="Image for List" variant="solo-inverted" />
                                </v-col>
                                <v-col cols="12">
                                    <v-textarea v-model="listData.description" label="List Description"></v-textarea>
                                </v-col>
                                <v-col cols="12">
                                    <v-card title="Choose a Product for your List">
                                        <template>
                                            <v-text-field density="compact" variant="solo"
                                                label="Search Meeovi for products" append-inner-icon="fas fa-search"
                                                single-line hide-details></v-text-field>
                                            <div class="d-flex pa-4">
                                                <v-checkbox-btn v-model="includeFiles" class="pe-2" color="orange">
                                                </v-checkbox-btn>
                                                <!--<NuxtLink :to="`/product/${products.id}`">
                                        <v-card class="ma-4" height="580" width="250" @click="toggle">
                                            <NuxtImg loading="lazy" class="align-end text-white" height="280"
                                                :src="`${products.featuredAsset.preview}`" :alt="products.name" cover />

                                            <template #title class="pt-4">
                                                {{ products.name }}
                                            </template>

                                            <template>
                                                <div>Sku: {{ products.variants.sku }}</div>
                                            </template>

                                            <template>
                                                <template>$ {{ products.variants.price }}
                                                </template>
                                            </template>
                                            <div class="d-flex fill-height align-center justify-center">
                                                <v-scale-transition>
                                                    <v-icon v-if="isSelected" color="white" size="48"
                                                        icon="mdi-close-circle-outline"></v-icon>
                                                </v-scale-transition>
                                            </div>
                                        </v-card>
                                    </NuxtLink>-->
                                            </div>
                                        </template>
                                    </v-card>
                                </v-col>
                            </v-row>
                        </v-container>
                        <small>*indicates required field</small>
                    </template>
                    <v-divider class="mt-12"></v-divider>
                    <template>
                        <v-btn color="blue-darken-1" variant="text" type="submit" @click="resetForm = false">
                            Reset
                        </v-btn>
                        <v-btn color="blue-darken-1" variant="text" type="submit">
                            Update
                        </v-btn>
                    </template>
                </v-form>
            </v-card>
        </v-row>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

import { useRoute, useRouter } from 'vue-router';
import uploadFiles from '#social/app/composables/lists/content/uploadFiles';
import updateList from '~/app/composables/lists/updateList';

const { $directus, $readItem } = useNuxtApp()
  const route = useRoute();
  const router = useRouter();

  const listData = ref({
    id: '',
    name: '',
    type: '',
    status: '',
    description: '',
    image: null,
  });

  const dialog = ref(false);
  const includeFiles = ref(true);
  const imageFile = ref(null);
  const loading = ref(false);

  const fetchListData = async () => {
    try {
      const listId = route.params.id;
      const resp = await $directus.request($readItem('lists', listId))
      const item = resp || {}
      listData.value = {
        id: item.id,
        name: item.name,
        type: item.type,
        status: item.status,
        description: item.description,
        image: item.image
      }
    } catch (error) {
      console.error('Error fetching list:', error);
    }
  };

// Load existing data when component mounts
onMounted(() => {
    if (route.params.id) {
        fetchListData();
    }
});

const handleImageUpload = (event) => {
    imageFile.value = event.target.files[0];
};

const resetForm = () => {
    listData.value = {
        name: '',
        type: '',
        status: '',
        description: '',
        image: null,
    };
    imageFile.value = null;
};

const handleSubmit = async () => {
    try {
        loading.value = true;

        // Handle image upload if there's a new image
        if (imageFile.value) {
            const uploadedFiles = await uploadFiles({
                imageFile: imageFile.value,
            });
            listData.value.image = uploadedFiles.imageId;
        }

        // Update the list
        const updatedList = await updateList(route.params.id, {
            name: listData.value.name,
            type: listData.value.type,
            status: listData.value.status,
            description: listData.value.description,
            image: listData.value.image,
        });

        console.log('List updated successfully:', updatedList);
        
        // Show success message (you can implement your preferred notification system)
        alert('List updated successfully');

    } catch (error) {
        console.error('Error updating list:', error);
        alert('Error updating list: ' + error.message);
    } finally {
        loading.value = false;
    }
};
</script>

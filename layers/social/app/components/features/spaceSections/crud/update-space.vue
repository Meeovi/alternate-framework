<template>
  <div>
      <v-row justify="center">
          <v-card>
            <v-form @submit.prevent="handleSubmit">
                  <v-toolbar dark color="primary">
                      <template>
                          <span class="text-h6">Update Space</span>
                      </template>
                  </v-toolbar>
                  <template>
                      <v-container>
                          <v-row>
                              <v-col cols="12">
                                  <v-text-field v-model="spaceData.name" id="spaceName" label="Space Name*" required />
                              </v-col>
                              <v-col cols="6">
                                  <v-select v-model="spaceData.type" label="What type of space is this?"
                                      :items="['Default', 'Audio', 'Video']" />
                              </v-col>
                              <v-col cols="6">
                                  <v-select v-model="spaceData.status" label="Is this space public or private?"
                                      :items="['Public', 'Private', 'Hidden']" />
                              </v-col>
                              <v-col cols="12">
                                  <v-textarea v-model="spaceData.description" label="Description" id="spaceDescription" />
                              </v-col>
                              <v-col cols="6">
                                  <v-file-upload @change="handleImageUpload" clearable density="compact"
                                      prepend-icon="fas fa-image" accept="image/*" label="Image for Cover"
                                      variant="solo-inverted" />
                              </v-col>
                              <v-col cols="6">
                                  <v-file-upload @change="handleAvatarUpload" clearable density="compact"
                                      prepend-icon="fas fa-image" accept="image/*" label="Image for Avatar"
                                      variant="solo-inverted" />
                              </v-col>
                          </v-row>
                      </v-container>
                      <small>*indicates required field</small>
                  </template>
                  <template>
                      <v-spacer></v-spacer>
                      <v-btn color="blue-darken-1" variant="text" @click="confirmDelete" :loading="deleteLoading">
                          Delete
                      </v-btn>
                      <v-btn color="blue-darken-1" variant="text" @click="resetForm = false">
                          Reset
                      </v-btn>
                      <v-btn color="blue-darken-1" variant="text" type="submit">
                          Update Space
                      </v-btn>
                  </template>
              </v-form>
          </v-card>
      </v-row>

      <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="500px">
            <v-card>
                <template #title class="text-h5">Delete Space</template>
                <template>
                    Are you sure you want to delete this space? This action cannot be undone.
                </template>
                <template>
                    <v-spacer></v-spacer>
                    <v-btn color="blue-darken-1" variant="text" @click="deleteDialog = false">
                        Cancel
                    </v-btn>
                    <v-btn color="error" variant="text" @click="deleteSpace" :loading="deleteLoading">
                        Delete
                    </v-btn>
                </template>
            </v-card>
        </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

 const { $readItem, $deleteItem, $updateItem, $uploadFiles } = useNuxtApp()
import updateSpace from '#social/app/composables/spaces/updateSpace';

const route = useRoute();
const router = useRouter();

// Add these new refs for delete functionality
const deleteDialog = ref(false);
const deleteLoading = ref(false);

const spaceData = ref({
    id: '', // Add this to store the space ID
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

// Function to fetch existing space data
const fetchSpaceData = async () => {
    try {
        const spaceId = route.params.id;
        const resp = await $sdk.content.readItem('spaces', spaceId)
        const response = resp || null

        if (response) {
            spaceData.value = {
                id: response.id,
                name: response.name,
                type: response.type,
                status: response.status,
                description: response.description,
                image: response.image
            };
        }
    } catch (error) {
        console.error('Error fetching space:', error);
    }
};

// Load existing data when component mounts
onMounted(() => {
    if (route.params.id) fetchSpaceData()
});

const handleImageUpload = (event) => {
    // v-file-upload may provide files directly or an event; normalize
    imageFile.value = event?.target?.files?.[0] || (Array.isArray(event) ? event[0] : event)
};

const resetForm = () => {
    spaceData.value = {
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
            const uploaded = await uploadFiles({ file: imageFile.value })
            // adapter may return file id in different shapes
            spaceData.value.image = uploaded?.id || uploaded?.imageId || uploaded
        }

        // Update the space using adapter
        const updated = await updateItem('spaces', route.params.id, {
            name: spaceData.value.name,
            type: spaceData.value.type,
            status: spaceData.value.status,
            description: spaceData.value.description,
            image: spaceData.value.image,
        })

        if (updated) {
            await fetchSpaceData()
            alert('Space updated successfully')
            navigateTo('/social/spaces')
        }
    } catch (error) {
        console.error('Error updating space:', error);
        alert('Error updating space: ' + error.message);
    } finally {
        loading.value = false;
    }
};


// Add these new functions for delete functionality
const confirmDelete = () => {
    deleteDialog.value = true;
};

const deleteSpace = async () => {
    try {
        deleteLoading.value = true;
        // Delete the space using adapter
        await deleteItem('spaces', route.params.id)
        
        // Close the delete dialog
        deleteDialog.value = false;
        
        // Show success message
        alert('Space deleted successfully');
        
        // Redirect to spaces page
        navigateTo('/social/spaces');
    } catch (error) {
        console.error('Error deleting space:', error);
        alert('Error deleting space: ' + error.message);
    } finally {
        deleteLoading.value = false;
    }
};

const validateForm = () => {
    if (!spaceData.value.name) {
        alert('Space name is required');
        return false;
    }
    return true;
};
</script>

<template>
  <div>
      <v-row justify="center">
          <v-card>
            <DynamicForm collection="spaces" />
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
import { DynamicForm } from '@mframework/meeovi-forms'
import updateSpace from '#social/app/composables/spaces/updateSpace';
import deleteSpaceRequest from '#social/app/composables/spaces/deleteSpace';

const props = defineProps({ space: Object })

const route = useRoute();
const router = useRouter();

// Add these new refs for delete functionality
const deleteDialog = ref(false);
const deleteLoading = ref(false);

const dialog = ref(false);

// Delete button in the template called `deleteSpace` as if it were a
// local function — nothing by that name was ever declared, so clicking
// Delete threw a ReferenceError. Named deleteSpace (matching the template)
// while importing the actual request as deleteSpaceRequest to avoid
// shadowing it.
async function deleteSpace() {
  if (!props.space?.id) return
  deleteLoading.value = true
  try {
    await deleteSpaceRequest(props.space.id)
    deleteDialog.value = false
    router.push('/connect/spaces')
  } catch (error) {
    console.error('Failed to delete space:', error)
  } finally {
    deleteLoading.value = false
  }
}
</script>

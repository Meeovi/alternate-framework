<template>
    <div class="text-center">
        <v-dialog v-model="dialog" max-width="600">
            <template v-slot:activator="{ props: activatorProps }">
                <v-btn prepend-icon="fas fa-plus" text="Add to List" color="primary" size="large"
                    v-bind="activatorProps"></v-btn>
            </template>

            <v-card>
                <v-tabs v-model="tab" bg-color="primary">
                    <v-tab value="one">Add to List</v-tab>
                    <v-tab value="two">Create List</v-tab>
                </v-tabs>

                <template>
                    <v-tabs-window v-model="tab">
                        <v-tabs-window-item value="one">
                            <v-card>
                                <template #title class="text-h6">
                                    Add this Product to your List
                                </template>
                                <template>
                                    <v-row dense>
                                        <v-col cols="12" sm="6">
                                            <v-autocomplete 
                                                v-model="selectedLists" 
                                                :items="lists" 
                                                item-title="name"
                                                item-value="id" 
                                                label="Choose a List" 
                                                auto-select-first 
                                                multiple
                                                chips
                                                :loading="loading"
                                                :disabled="loading"
                                            />
                                        </v-col>
                                    </v-row>

                                    <div v-if="productPreview" class="mt-4">
                                        <v-img :src="productPreview.image" height="100" cover class="rounded" />
                                        <div class="mt-2 text-subtitle-1">{{ productPreview.name }}</div>
                                        <div class="text-caption text-grey">{{ productPreview.sku }}</div>
                                    </div>

                                    <v-alert
                                        v-if="error"
                                        type="error"
                                        class="mt-4"
                                    >
                                        {{ error }}
                                    </v-alert>
                                </template>

                                <v-divider></v-divider>

                                <template>
                                    <v-spacer></v-spacer>
                                    <v-btn text="Close" variant="plain" @click="closeDialog"></v-btn>
                                    <v-btn 
                                        color="primary" 
                                        text="Save" 
                                        variant="tonal" 
                                        @click="saveToLists"
                                        :loading="loading"
                                        :disabled="loading || selectedLists.length === 0"
                                    >
                                        Save
                                    </v-btn>
                                </template>
                            </v-card>
                        </v-tabs-window-item>

                        <v-tabs-window-item value="two">
                            <createlist @list-created="handleListCreated" />
                        </v-tabs-window-item>
                    </v-tabs-window>
                </template>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from '#imports';

// Define props with Magento product structure
const props = defineProps({
    product: {
        type: Object,
        required: true,
        validator: (value) => {
            return value && value.uid && value.name && value.sku;
        }
    }
});

const emit = defineEmits(['item-added']);

const { user, fetchSession } = useAuth();
await fetchSession();
const getCurrentUserId = () => (user.value && (user.value.id || user.value.userId)) || null;

const { $directus, $readItems, $createItem } = useNuxtApp();

const dialog = ref(false);
const tab = ref('one');
const lists = ref([]);
const selectedLists = ref([]);
const loading = ref(false);
const error = ref(null);

// Fetch user's lists through the content gateway
const fetchLists = async () => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return;
    
    loading.value = true;
    error.value = null;

    try {
        const resp = await $directus.request($readItems('lists', {
            filter: {
                user: { _eq: currentUserId }
            },
            fields: ['id', 'name', 'description']
        }))
        lists.value = resp && resp.data ? resp.data : resp;
    } catch (err) {
        console.error('Error fetching lists:', err);
        error.value = 'Failed to load your lists. Please try again.';
    } finally {
        loading.value = false;
    }
};

onMounted(fetchLists);

// Save product to selected lists
const saveToLists = async () => {
    if (!props.product?.uid || selectedLists.value.length === 0) return;

    loading.value = true;
    error.value = null;

    try {
        // Check if product already exists in any of the selected lists
        const existingItems = await Promise.all(
            selectedLists.value.map(listId => 
                isProductInList(listId, props.product.uid)
            )
        );

        // Filter out lists where the product already exists
        const newLists = selectedLists.value.filter((_, index) => !existingItems[index]);

        if (newLists.length === 0) {
            error.value = 'This product is already in all selected lists.';
            return;
        }

        // Create list items for each selected list
        const promises = newLists.map(listId => {
            return $directus.request($createItem('list_items', {
                list: listId,
                magento_product_uid: props.product.uid,
                magento_product_sku: props.product.sku,
                magento_product_name: props.product.name,
                magento_product_image: props.product.image?.url || null,
                date_added: new Date().toISOString()
            }))
        })

        await Promise.all(promises)

        // Emit event for parent component
        emit('item-added', {
            product: props.product,
            lists: newLists
        })

        closeDialog()
    } catch (err) {
        console.error('Error saving to lists:', err);
        error.value = 'Failed to add product to lists. Please try again.';
    } finally {
        loading.value = false;
    }
};

const closeDialog = () => {
    dialog.value = false;
    selectedLists.value = [];
    error.value = null;
};

// Handle newly created list
const handleListCreated = (newList) => {
    lists.value.push(newList);
    selectedLists.value = [newList.id];
    tab.value = 'one';
};

// Computed property for product preview
const productPreview = computed(() => {
    if (!props.product) return null;
    
    return {
        image: props.product.image?.url || '',
        name: props.product.name,
        sku: props.product.sku
    };
});

const isProductInList = async (listId, productUid) => {
    try {
        const resp = await $directus.request($readItems('list_items', {
            filter: {
                list: { _eq: listId },
                magento_product_uid: { _eq: productUid }
            }
        }))
        const items = resp && resp.data ? resp.data : resp;
        return Array.isArray(items) && items.length > 0;
    } catch (error) {
        console.error('Error checking product in list:', error);
        return false;
    }
};
</script>

<style scoped>
.v-card {
    border-radius: 8px;
}
</style>

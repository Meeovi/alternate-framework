<template>
    <div class="contentPage">
        <v-card variant="text">
            <v-toolbar :style="`background-color: ${listBar?.color}; color: ${listBar?.colortext} !important`">
                <v-toolbar-title>
                    <div class="listsToolbarTitle">
                        {{ listBar?.name }}
                        <v-tooltip interactive>
                            <template v-slot:activator="{ props: activatorProps }">
                                <v-icon-btn size="small" icon="fas fa-circle-info" v-bind="activatorProps"></v-icon-btn>
                            </template>
                            <div>
                                <p class="listsToolbarTooltip" v-dompurify-html="listBar?.description"></p>
                            </div>
                        </v-tooltip>
                    </div>
                </v-toolbar-title>

                <v-tabs v-model="tab" align-tabs="center">
                    <div v-for="(menu, index) in listBar?.menus" :key="index">
                        <v-tab :value="menu?.value">
                            <v-btn variant="text"
                                :style="`color: ${listBar?.colortext} !important`">{{ menu?.name }}</v-btn>
                        </v-tab>
                    </div>
                </v-tabs>
            </v-toolbar>
        </v-card>

        <v-tabs-window v-model="tab" style="margin-top: 10px;">
            <!-- All Lists -->
            <v-tabs-window-item :value="listBar?.menus?.[0]?.value">
                <v-row>
                    <v-col cols="3" v-if="lists?.length" v-for="list in listGrid" :key="list.id">
                        <ListCard :list="list" />
                    </v-col>
                    <div class="center-text" v-else-if="!loadingPosts">No Lists yet</div>
                </v-row>
            </v-tabs-window-item>

            <!-- Starred Lists -->
            <v-tabs-window-item :value="listBar?.menus?.[1]?.value">
                <v-row>
                    <v-col v-if="starredLists?.length" cols="3" v-for="list in starredLists" :key="list.id">
                        <ListCard :list="list" />
                    </v-col>
                    <div class="center-text" v-else>No Starred Lists yet</div>
                </v-row>
            </v-tabs-window-item>

            <!-- Bookmarks -->
            <v-tabs-window-item :value="listBar?.menus?.[2]?.value">
                <v-row>
                    <v-col cols="3" v-if="bookmarks?.length" v-for="bookmark in bookmarks" :key="bookmark.id">
                        <ListCard :list="bookmark" />
                    </v-col>

                    <div class="center-text" v-else>No Bookmarks yet</div>
                </v-row>
            </v-tabs-window-item>

            <!-- Public Lists -->
            <v-tabs-window-item :value="listBar?.menus?.[3]?.value">
                <v-row>
                    <v-col v-if="publicLists?.length" cols="3" v-for="pub in publicLists" :key="pub.id">
                        <ListCard :list="pub" />
                    </v-col>
                    <div class="center-text" v-else>No public lists yet</div>
                </v-row>
            </v-tabs-window-item>

            <!-- Collections -->
            <v-tabs-window-item :value="listBar?.menus?.[4]?.value">
                <v-row>
                    <v-col v-if="collectionLists?.length" cols="3" v-for="collection in collectionLists"
                        :key="collection.id">
                        <ListCard :list="collection" />
                    </v-col>
                    <div class="center-text" v-else>No collections yet</div>
                </v-row>
            </v-tabs-window-item>

            <!-- Archived Lists -->
            <v-tabs-window-item :value="listBar?.menus?.[5]?.value">
                <v-row>
                    <v-col v-if="archivedLists?.length" cols="3" v-for="archive in archivedLists" :key="archive.id">
                        <ListCard :list="archive" />
                    </v-col>
                    <div class="center-text" v-else>No archived lists yet</div>
                </v-row>
            </v-tabs-window-item>

            <!-- Wishlists (lists of type "Wishlist"; the heart on a product saves to yours) -->
            <v-tabs-window-item :value="listBar?.menus?.[6]?.value">
                <div class="d-flex justify-end mb-2">
                    <v-btn color="primary" prepend-icon="fas fa-plus" text="New Wishlist" @click="openWishlistDialog()" />
                </div>
                <v-row>
                    <v-col v-if="wishlists?.length" cols="3" v-for="wishlist in wishlists" :key="wishlist.id">
                        <ListCard :list="wishlist" />
                        <div class="d-flex justify-end ga-1 mt-1">
                            <v-btn size="small" variant="text" prepend-icon="fas fa-pen" text="Edit"
                                @click="openWishlistDialog(wishlist)" />
                            <v-btn size="small" variant="text" color="error" prepend-icon="fas fa-trash" text="Delete"
                                @click="wishlistToDelete = wishlist" />
                        </div>
                    </v-col>
                    <div class="center-text" v-else>No wishlist yet — create one, or tap the heart on any product to start one.</div>
                </v-row>
            </v-tabs-window-item>
        </v-tabs-window>

        <!-- Create / edit a wishlist -->
        <v-dialog v-model="wishlistDialog" max-width="480">
            <v-card :title="wishlistForm.id ? 'Edit Wishlist' : 'New Wishlist'">
                <v-form @submit.prevent="saveWishlist">
                    <v-card-text>
                        <v-text-field v-model="wishlistForm.name" label="Name" :rules="[(v) => !!v?.trim() || 'Name is required']" />
                        <v-textarea v-model="wishlistForm.description" label="Description" rows="2" auto-grow />
                        <v-select v-model="wishlistForm.status" label="Visibility" :items="['Private', 'Public']" />
                        <v-alert v-if="wishlistError" type="error" density="compact">{{ wishlistError }}</v-alert>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer />
                        <v-btn variant="text" text="Cancel" @click="wishlistDialog = false" />
                        <v-btn type="submit" color="primary" :loading="wishlistSaving" :disabled="!wishlistForm.name?.trim()"
                            :text="wishlistForm.id ? 'Save' : 'Create'" />
                    </v-card-actions>
                </v-form>
            </v-card>
        </v-dialog>

        <!-- Delete a wishlist -->
        <v-dialog :model-value="!!wishlistToDelete" max-width="420" @update:model-value="(open) => { if (!open) wishlistToDelete = null }">
            <v-card title="Delete Wishlist">
                <v-card-text>
                    Delete "{{ wishlistToDelete?.name }}" and everything saved in it? This can't be undone.
                    <v-alert v-if="wishlistError" type="error" density="compact" class="mt-3">{{ wishlistError }}</v-alert>
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn variant="text" text="Cancel" @click="wishlistToDelete = null" />
                    <v-btn color="error" text="Delete" :loading="wishlistSaving" @click="deleteWishlist" />
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup>
    import ListCard from '../../components/related/list.vue'
    import { useLists } from '../../composables/lists/useLists'
    import {
        authClient
    } from "#auth/lib/auth-client";
    import {
        useInfiniteScroll
    } from '@vueuse/core'

    // authClient.useSession() returns the Vue ref itself (readonly(shallowRef)
    // from better-auth's vue-store.mjs), not a {data,...} object and not a
    // promise — the `await` was a no-op. session.value.data is the actual
    // {user, session} payload.
    const session = authClient.useSession();

    const tab = ref(null)
    const {
        $directus,
        $readItem,
        $readItems
    } = useNuxtApp()

    const {
        data: listGrid
    } = await useAsyncData('listGrid', async () => {
        const resp = await $directus.request($readItems('lists', {
            filter: {
                user: {
                    _eq: `${session?.user?.id}`
                },
            }
        }))
        return resp?.data || resp || []
    })

    const {
        data: starredLists
    } = await useAsyncData('starredLists', async () => {
        const resp = await $directus.request($readItems('lists', {
            filter: {
                favorite: {
                    _eq: 'yes'
                },
            }
        }))
        return resp?.data || resp || []
    })

    const {
        data: bookmarks
    } = await useAsyncData('bookmarks', async () => {
        const resp = await $directus.request($readItems('lists', {
            filter: {
                lists_type: {
                    lists_type_id: {
                        name: {
                            _eq: 'Bookmarks'
                        }
                    }
                }
            }
        }))
        return resp?.data || resp || []
    })

    const {
        data: collectionLists
    } = await useAsyncData('collectionLists', async () => {
        const resp = await $directus.request($readItems('lists', {
            filter: {
                lists_type: {
                    lists_type_id: {
                        name: {
                            _eq: 'Collection'
                        }
                    }
                }
            }
        }))
        return resp?.data || resp || []
    })

    const {
        data: publicLists
    } = await useAsyncData('publicLists', async () => {
        // Directus's nested filter on the `lists_type` M2M relation is
        // existential for both _eq and _neq alike — "at least one related
        // row matches" — it is NOT the boolean negation of _eq. A list
        // tagged with both "Showcase" and "Collection" satisfies
        // `_neq: 'Collection'` via its Showcase tag even though it's also
        // a Collection, so it kept showing up here. Exclude the known
        // Collection ids directly instead of trying to negate the
        // relation in a single nested filter.
        const collectionIds = (collectionLists.value || []).map((list) => list.id)
        const resp = await $directus.request($readItems('lists', {
            filter: {
                status: {
                    _eq: 'Public'
                },
                ...(collectionIds.length ? { id: { _nin: collectionIds } } : {})
            }
        }))
        return resp?.data || resp || []
    })

    // The signed-in user's own wishlists (server/api/social/lists): lists of
    // type "Wishlist", created, edited and deleted here like any list. The
    // product heart saves into the oldest one (server/utils/wishlist.ts).
    const requestFetch = useRequestFetch()
    const {
        data: wishlists,
        refresh: refreshWishlists
    } = await useAsyncData('wishlists', () =>
        requestFetch('/api/social/lists', { query: { listsType: 'Wishlist' } }).catch(() => []))

    const { createList, updateList, deleteList } = useLists()
    const wishlistDialog = ref(false)
    const wishlistForm = ref({ id: null, name: '', description: '', status: 'Private' })
    const wishlistToDelete = ref(null)
    const wishlistSaving = ref(false)
    const wishlistError = ref('')

    const openWishlistDialog = (wishlist) => {
        wishlistError.value = ''
        wishlistForm.value = wishlist
            ? { id: wishlist.id, name: wishlist.name ?? '', description: wishlist.description ?? '', status: wishlist.status === 'Public' ? 'Public' : 'Private' }
            : { id: null, name: '', description: '', status: 'Private' }
        wishlistDialog.value = true
    }

    const saveWishlist = async () => {
        const { id, name, description, status } = wishlistForm.value
        if (!name?.trim() || wishlistSaving.value) return
        wishlistSaving.value = true
        wishlistError.value = ''
        try {
            if (id) await updateList(id, { name: name.trim(), description, status })
            else await createList({ name: name.trim(), description, status, type: 'Product', listsType: 'Wishlist' })
            wishlistDialog.value = false
            await refreshWishlists()
        } catch (err) {
            console.error('Failed to save wishlist', err)
            wishlistError.value = 'Failed to save the wishlist. Please try again.'
        } finally {
            wishlistSaving.value = false
        }
    }

    const deleteWishlist = async () => {
        if (!wishlistToDelete.value || wishlistSaving.value) return
        wishlistSaving.value = true
        wishlistError.value = ''
        try {
            await deleteList(wishlistToDelete.value.id)
            wishlistToDelete.value = null
            await refreshWishlists()
        } catch (err) {
            console.error('Failed to delete wishlist', err)
            wishlistError.value = 'Failed to delete the wishlist. Please try again.'
        } finally {
            wishlistSaving.value = false
        }
    }

    const {
        data: archivedLists
    } = await useAsyncData('archivedLists', async () => {
        const resp = await $directus.request($readItems('lists', {
            filter: {
                status: {
                    _eq: 'Archived'
                },
            }
        }))
        return resp?.data || resp || []
    })

    const {
        data: listBar
    } = await useAsyncData('listBar', async () => {
        const resp = await $directus.request($readItem('navigation', '46', {
            fields: ['*', {
                '*': ['*']
            }]
        }))
        return resp?.data ?? resp ?? null
    })

    // /lists?tab=wishlists (where /wishlist redirects) opens the Wishlists
    // tab; tab values come from the navigation menus, which are index-based.
    if (useRoute().query.tab === 'wishlists') tab.value = listBar.value?.menus?.[6]?.value ?? null

    definePageMeta({
        middleware: 'auth'
    })

    useHead({
        title: 'Meeovi Tasks'
    })
</script>
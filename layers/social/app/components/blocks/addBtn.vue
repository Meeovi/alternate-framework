<template>
    <div>
        <v-speed-dial location="top center" transition="fade-transition" class="feedButton">
            <template v-slot:activator="{ props: activatorProps }">
                <v-fab v-bind="activatorProps" size="large" icon="fas fa-plus"></v-fab>
            </template>

            <addPost key="1" />
            <addLive key="2" />
            <addList key="3" />
            <addProduct key="4" v-if="session?.user?.role === 'seller'" />
        </v-speed-dial>
    </div>
</template>

<script setup>
    import { authClient } from '#auth/lib/auth-client'
    import addPost from '../menus/BottomFooter.vue'
    import addLive from '../features/vibeSections/add-live.vue'
    import addList from '../blocks/partials/listBtn.vue'
    import addProduct from '#commerce/app/components/catalog/product/add-product.vue'

    const { data: session } = authClient.useSession()
</script>
<template>
    <div>
        <v-dialog max-width="500">
            <template v-slot:activator="{ props: activatorProps }">
                <v-btn v-bind="activatorProps" prepend-icon="fas:fa fa-plus" color="white" text="Create a List"
                    variant="text"></v-btn>
            </template>

            <template v-slot:default="{ isActive }">
                <div v-if="target.type === 'product'">
                    <addtolist :target="productId.id" />
                </div>

                <div v-if="target.type === 'post'">
                    <addtolist :target="postId.id" />
                </div>
            </template>
        </v-dialog>
    </div>
</template>

<script setup>
    import addtolist from '../lists/add-list.vue'

    defineProps({
        productId: {
            type: String,
            required: true
        },
        postId: {
            type: String,
            required: true
        }
    });
</script>
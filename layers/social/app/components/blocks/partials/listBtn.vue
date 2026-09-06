<template>
    <div>
        <v-dialog max-width="500">
            <template v-slot:activator="{ props: activatorProps }">
                <v-btn v-bind="activatorProps" prepend-icon="fas fa-plus" text="Create a List"
                    variant="text"></v-btn>
            </template>

            <template v-slot:default="{ isActive }">
                <v-card title="Create A List">
                    <addList style="padding: 15px;" />

                    <v-card-actions>
                        <v-spacer></v-spacer>

                        <v-btn text="Close" @click="isActive.value = false"></v-btn>
                    </v-card-actions>
                </v-card>
            </template>
        </v-dialog>
    </div>
</template>

<script setup>
    import addList from '../../features/lists/add-list.vue'
</script>
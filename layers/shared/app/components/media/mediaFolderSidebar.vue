<template>
    <v-navigation-drawer permanent width="260" class="media-folder-sidebar">
        <v-list>
            <v-list-item>
                <v-list-item-title class="text-h6">Folders</v-list-item-title>
            </v-list-item>

            <v-list-item v-for="(folder, index) in localFolders" :key="folder.id" draggable="true"
                @dragstart="onDragStart(index)" @dragover.prevent @drop="onDrop(index)"
                @click="$emit('select', folder)">
                <v-list-item-title>{{ folder.name }}</v-list-item-title>
            </v-list-item>

            <v-divider class="my-3" />

            <v-list-item>
                <v-btn block color="primary" @click="createNewFolder">
                    New Folder
                </v-btn>
            </v-list-item>
        </v-list>
    </v-navigation-drawer>
</template>

<script setup>
    import {
        ref,
        watch
    } from 'vue'

    const props = defineProps({
        folders: {
            type: Array,
            default: () => []
        },
    })
    const emit = defineEmits(['create', 'select', 'reorder'])

    const localFolders = ref([...props.folders])
    const dragIndex = ref(null)

    watch(
        () => props.folders,
        (val) => {
            localFolders.value = [...val]
        }
    )

    const onDragStart = (index) => {
        dragIndex.value = index
    }
    const onDrop = (targetIndex) => {
        if (dragIndex.value === null) return
        const updated = [...localFolders.value]
        const [moved] = updated.splice(dragIndex.value, 1)
        updated.splice(targetIndex, 0, moved)
        localFolders.value = updated
        dragIndex.value = null
        emit('reorder', updated)
    }

    const createNewFolder = () => {
        const name = prompt('Folder name')
        if (name) emit('create', name)
    }
</script>

<style scoped>
    .media-folder-sidebar {
        border-right: 1px solid #ddd;
    }
</style>
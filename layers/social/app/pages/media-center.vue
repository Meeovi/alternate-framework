<template>
    <div class="contentPage">
        <!-- Top Toolbar -->
        <v-toolbar
            :title="mediaBarData?.name || 'Media Center'"
            :style="`background-color: ${mediaBarData?.color || 'DarkMagenta'}; color: ${mediaBarData?.colortext || 'white'}`"
        >
            <v-spacer />
            <v-btn prepend-icon="fas fa-upload" variant="tonal" @click="triggerUpload">
                Upload
            </v-btn>
            <input ref="fileInput" type="file" multiple class="d-none" @change="onFilePicked" />
        </v-toolbar>

        <v-alert
            v-if="uploadError"
            type="error"
            variant="tonal"
            class="mx-4 mt-4"
            closable
            @click:close="clearUploadError"
        >
            {{ uploadError }}
        </v-alert>

        <!-- SVAR Filemanager Component -->
        <ClientOnly>
            <Willow>
                <Tooltip overflow :api="api">
                    <Filemanager
                        ref="api"
                        :data="rawdata"
                        :drive="drive"
                        :menuOptions="menuOptions"
                        :extraInfo="extraInfo"
                        :previews="previews"
                        :icons="icons"
                        :init="init"
                        mode="panels"
                        :panels="panels"
                    />
                </Tooltip>
            </Willow>
        </ClientOnly>
    </div>
</template>

<script setup lang="ts">
import { useHead } from 'nuxt/app'
import { Filemanager, Willow, Tooltip } from '@svar-ui/vue-filemanager'
import '@svar-ui/vue-filemanager/all.css'
import { useMediaCenter } from '../composables/media/useMediaCenter'

const {
    api,
    rawdata,
    drive,
    fileInput,
    panels,
    mediaBarData,
    uploadError,
    menuOptions,
    previews,
    icons,
    extraInfo,
    init,
    triggerUpload,
    onFilePicked,
    clearUploadError,
} = useMediaCenter()

useHead({ title: 'Media Center' })
</script>

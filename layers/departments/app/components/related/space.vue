<template>
    <div>
        <div class="card card-1 col-12 col-lg-6" :style="`backgroundImage: url(${$directus.url}assets/${space?.image?.filename_disk})`">
            <div class="card-wrap">
                <div class="item-content">
                    <h5 class="card-title-1 mbr-fonts-style align-center display-7">
                        <strong>{{ space?.type }}</strong>
                    </h5>
                    <h6 class="card-subtitle-1 mb-0 mbr-fonts-style align-center display-2">
                        <strong>
                            {{ space?.name }}
                        </strong>
                    </h6>
                    <p class="card-text-1 mbr-fonts-style align-center mb-0 display-7">Created: {{ new Date(space?.date_created).toLocaleDateString() }}</p>
                    <p class="card-text-1 mbr-fonts-style align-center mb-0 display-7">
                        {{ space?.description }}
                    </p>
                    <div class="mbr-section-btn mbr-section-btn-1 align-center">
                        <NuxtLink :href="`/social/group/${space?.id}`" class="btn btn-danger display-7" target="_blank">
                            <span class="mobi-mbri mobi-mbri-arrow-next mbr-iconfont mbr-iconfont-btn"></span>
                            Learn More
                        </NuxtLink>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import {
        ref
    } from 'vue'

    const {
        $directus
    } = useNuxtApp()

    const props = defineProps({
        space: {
            type: Object,
            required: true,
        },
    })

    const {
        space
    } = props

    const getTypeColor = (type) => {
        const colors = {
            'Audio': 'purple',
            'Video': 'red',
            'Text': 'blue',
            'Mixed': 'green'
        }
        return colors[type] || 'grey'
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown date'
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const joinSpace = async () => {
        // TODO: Implement join space functionality
        console.log('Joining space:', space.id)
    }

    const shareSpace = () => {
        const url = `${window.location.origin}/social/group/${space.id}`
        navigator.clipboard.writeText(url)
        console.log('Space link copied to clipboard')
    }
</script>
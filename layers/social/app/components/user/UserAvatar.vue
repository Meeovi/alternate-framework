<template>
    <v-avatar :size="size" :color="src ? undefined : color" :variant="src ? undefined : 'tonal'"
        :image="src || undefined">
        <span v-if="!src" class="text-subtitle-2 font-weight-bold">{{ initials }}</span>
    </v-avatar>
</template>

<script setup lang="ts">
    const props = withDefaults(defineProps < {
        src ? : string
        name ? : string
        email ? : string
        size ? : string | number
        color ? : string
    } > (), {
        src: '',
        name: '',
        email: '',
        size: 32,
        color: 'primary',
    })

    const initials = computed(() => {
        const displayName = props.name.trim()
        if (displayName) {
            const parts = displayName.split(/\s+/).slice(0, 2)
            return parts.map(p => p.charAt(0).toUpperCase()).join('') || 'G'
        }
        if (props.email.trim()) {
            return props.email.trim().charAt(0).toUpperCase()
        }
        return 'G'
    })
</script>
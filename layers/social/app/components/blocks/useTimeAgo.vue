<template>
    <div class="useTimeAgo" :class="computedClasses">
        <span v-if="label" class="useTimeAgo-label">{{ label }} </span>
        <span class="useTimeAgo-value">{{ timeAgo }}</span>
    </div>
</template>

<script setup>
// The renderless <UseTimeAgo> component this used to render doesn't exist
// in the installed @vueuse/core (v14) — that API moved to a separate
// @vueuse/components package this project doesn't depend on (confirmed
// live: importing it threw "does not provide an export named
// 'UseTimeAgo'" the first time this component was actually rendered
// anywhere — see connect/related/post.vue). Using the plain useTimeAgo
// composable directly instead — idiomatic for <script setup> and needs
// no extra dependency.
import { useTimeAgo } from '@vueuse/core'
import { computed } from 'vue'

const props = defineProps({
    time: {
        type: [Date, Number, String],
        default: () => new Date(2021, 0, 1)
    },
    label: {
        type: String,
        default: 'Time Ago:'
    },
    size: {
        type: String,
        default: 'medium',
        validator: (value) => ['small', 'medium', 'large'].includes(value)
    }
})

const timeAgo = useTimeAgo(computed(() => props.time))

const computedClasses = computed(() => ({
    [`size-${props.size}`]: true
}))
</script>

<style scoped>
.useTimeAgo {
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.useTimeAgo-value {
    font-variant-numeric: tabular-nums;
}

.useTimeAgo-label {
    font-weight: 500;
}

.useTimeAgo.size-small .useTimeAgo-value {
    font-size: 0.75rem;
}

.useTimeAgo.size-small .useTimeAgo-label {
    font-size: 0.75rem;
}

.useTimeAgo.size-large .useTimeAgo-value {
    font-size: 1.125rem;
}

.useTimeAgo.size-large .useTimeAgo-label {
    font-size: 1.125rem;
}
</style>

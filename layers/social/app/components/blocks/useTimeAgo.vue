<template>
    <div class="useTimeAgo" :class="computedClasses">
        <UseTimeAgo :time="time">
            <template #default="{ timeAgo }">
                <span v-if="label" class="useTimeAgo-label">{{ label }} </span>
                <span class="useTimeAgo-value">{{ timeAgo }}</span>
            </template>
        </UseTimeAgo>
    </div>
</template>

<script setup>
import { UseTimeAgo } from '@vueuse/core'
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

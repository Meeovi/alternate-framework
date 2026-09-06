<template>
    <div class="useTimestamp" :class="computedClasses">
        <span v-if="label" class="useTimestamp-label">{{ label }} </span>
        <span class="useTimestamp-value">{{ timestamp }}</span>

        <div v-if="showControls" class="useTimestamp-controls">
            <button v-if="showControls" @click="pause()" class="useTimestamp-btn">
                Pause
            </button>
            <button v-if="showControls" @click="resume()" class="useTimestamp-btn">
                Resume
            </button>
        </div>
    </div>
</template>

<script setup>
// The renderless <UseTimestamp> component this used to render doesn't
// exist in the installed @vueuse/core (v14) — that API moved to a
// separate @vueuse/components package this project doesn't depend on
// (same issue confirmed live on useOnline.vue/useTimeAgo.vue the first
// time each was actually rendered anywhere). Using the plain useTimestamp
// composable directly instead (with controls: true, matching this
// component's existing pause/resume buttons) — idiomatic for
// <script setup> and needs no extra dependency.
import { useTimestamp } from '@vueuse/core'
import { computed } from 'vue'

const props = defineProps({
    time: {
        type: [Date, Number, String],
        default: () => new Date()
    },
    offset: {
        type: Number,
        default: 0
    },
    showControls: {
        type: Boolean,
        default: true
    },
    label: {
        type: String,
        default: 'Current Time:'
    },
    size: {
        type: String,
        default: 'medium',
        validator: (value) => ['small', 'medium', 'large'].includes(value)
    }
})

const { timestamp, pause, resume } = useTimestamp({ offset: props.offset, controls: true })

const computedClasses = computed(() => ({
    [`size-${props.size}`]: true
}))
</script>

<style scoped>
.useTimestamp {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}

.useTimestamp-value {
    font-variant-numeric: tabular-nums;
}

.useTimestamp-label {
    font-weight: 500;
}

.useTimestamp-controls {
    display: inline-flex;
    gap: 4px;
    margin-left: 4px;
}

.useTimestamp-btn {
    padding: 2px 8px;
    border: 1px solid #ddd;
    background: #fff;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.75rem;
}

.useTimestamp-btn:hover {
    background: #f5f5f5;
}

.useTimestamp.size-small .useTimestamp-value {
    font-size: 0.75rem;
}

.useTimestamp.size-small .useTimestamp-label {
    font-size: 0.75rem;
}

.useTimestamp.size-large .useTimestamp-value {
    font-size: 1.125rem;
}

.useTimestamp.size-large .useTimestamp-label {
    font-size: 1.125rem;
}
</style>

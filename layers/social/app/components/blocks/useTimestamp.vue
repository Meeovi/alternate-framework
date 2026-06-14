<template>
    <div class="useTimestamp" :class="computedClasses">
        <UseTimestamp v-slot="{ timestamp, pause, resume }" :time="time" :offset="offset" :controls="showControls">
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
        </UseTimestamp>
    </div>
</template>

<script setup>
import {
    UseTimestamp
} from '@vueuse/core'
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

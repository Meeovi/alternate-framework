<template>
    <div class="useOnline" :class="computedClasses">
        <UseOnline v-slot="{ isOnline }">
            <span v-if="showIndicator" class="useOnline-indicator" :class="{ online: isOnline, offline: !isOnline }"></span>
            
            <span v-if="showLabel" class="useOnline-label">
                {{ label }} {{ isOnline ? onlineText : offlineText }}
            </span>

            <span v-if="!showLabel" :class="{ online: isOnline, offline: !isOnline }">
                {{ isOnline ? onlineText : offlineText }}
            </span>
        </UseOnline>
    </div>
</template>

<script setup>
import {
    useOnline
} from '@vueuse/core'
import { computed } from 'vue'

const props = defineProps({
    label: {
        type: String,
        default: 'Is Online:'
    },
    showLabel: {
        type: Boolean,
        default: true
    },
    showIndicator: {
        type: Boolean,
        default: true
    },
    onlineText: {
        type: String,
        default: 'Online'
    },
    offlineText: {
        type: String,
        default: 'Offline'
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
.useOnline {
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.useOnline-indicator {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    display: inline-block;
    flex-shrink: 0;
}

.useOnline-indicator.online {
    background-color: #4caf50;
}

.useOnline-indicator.offline {
    background-color: #f44336;
}

.useOnline-label {
    font-weight: 500;
}

.useOnline .online {
    color: #4caf50;
}

.useOnline .offline {
    color: #f44336;
}

.useOnline.size-small .useOnline-indicator {
    width: 8px;
    height: 8px;
}

.useOnline.size-small .useOnline-label {
    font-size: 0.75rem;
}

.useOnline.size-large .useOnline-indicator {
    width: 14px;
    height: 14px;
}

.useOnline.size-large .useOnline-label {
    font-size: 1.125rem;
}
</style>
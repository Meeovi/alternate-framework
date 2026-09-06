<template>
    <div class="useOnline" :class="computedClasses">
        <span v-if="showIndicator" class="useOnline-indicator" :class="{ online: isOnline && atprotoOk, offline: !isOnline || !atprotoOk }"></span>

        <span v-if="showLabel" class="useOnline-label">
            {{ label }} {{ isOnline && atprotoOk ? onlineText : offlineText }}
        </span>

        <span v-if="!showLabel" :class="{ online: isOnline && atprotoOk, offline: !isOnline || !atprotoOk }">
            {{ isOnline && atprotoOk ? onlineText : offlineText }}
        </span>
    </div>
</template>

<script setup>
// The renderless <UseOnline> component this used to render doesn't exist
// in the installed @vueuse/core (v14) — that API moved to a separate
// @vueuse/components package this project doesn't depend on, and this
// component's own name (useOnline.vue) collided with the (nonexistent)
// global <UseOnline> anyway. Using the plain composable directly here —
// idiomatic for <script setup> and needs no extra dependency.
import {
    useOnline
} from '@vueuse/core'
import { computed, ref, onMounted } from 'vue'

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
    },
    // When set, this stops being plain browser-connectivity detection and
    // also reflects whether the atproto/PDS service itself is reachable
    // (GET /api/social/atproto/status) — "online" then means both the
    // browser has a network connection AND the federation backend
    // answered. Defaults to false: existing usages (there weren't any
    // before this was wired up) keep the original browser-only behavior
    // unless a caller opts in.
    checkAtproto: {
        type: Boolean,
        default: false
    }
})

const isOnline = useOnline()

const computedClasses = computed(() => ({
    [`size-${props.size}`]: true
}))

// Not checked at all (atprotoOk stays true) unless checkAtproto is set —
// same reasoning as the prop's own default.
const atprotoOk = ref(true)

onMounted(async () => {
    if (!props.checkAtproto) return
    try {
        const status = await $fetch('/api/social/atproto/status')
        atprotoOk.value = Boolean(status?.reachable)
    } catch {
        atprotoOk.value = false
    }
})
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

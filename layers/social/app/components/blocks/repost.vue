<template>
    <div>
        <UButton
            stacked
            :icon="icon"
            :title="title"
            variant="text"
            :class="{ reposted: !!reposted }"
            @click="onClick"
            :disabled="loading"
        >
            <template #default>
                <span v-if="loading">…</span>
                <span v-else>{{ reposted ? unRepostLabel : repostLabel }}</span>
            </template>
        </UButton>
    </div>
</template>

<script setup>
</script>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import useRepost from '../../composables/useRepost'

const props = defineProps({
    postId: { type: [String, Number], required: true },
    initialReposted: { type: Boolean as () => boolean | undefined, default: undefined },
    repostLabel: { type: String, default: 'Repost' },
    unRepostLabel: { type: String, default: 'Undo Repost' },
    icon: { type: String, default: 'fas fa-retweet' },
    title: { type: String, default: 'Repost' }
})

const emit = defineEmits(['update:reposted', 'change'])

const { isReposted, toggleRepost } = useRepost()

const reposted = ref<boolean | undefined>(props.initialReposted)
const loading = ref(false)

onMounted(async () => {
    if (reposted.value === undefined) {
        try {
            const res = await isReposted(props.postId)
            reposted.value = typeof res === 'boolean' ? res : !!res?.reposted
        } catch (_) {
            reposted.value = false
        }
    }
})

async function onClick() {
    if (loading.value) return
    loading.value = true
    try {
        const res = await toggleRepost(props.postId)
        if (res && typeof res.reposted !== 'undefined') {
            reposted.value = !!res.reposted
        } else if (typeof res === 'boolean') {
            reposted.value = res
        } else {
            reposted.value = !reposted.value
        }
        emit('update:reposted', reposted.value)
        emit('change', reposted.value)
    } finally {
        loading.value = false
    }
}
</script>
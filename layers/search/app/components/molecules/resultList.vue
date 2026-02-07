<template>
    <div class="result-list">
        <div v-if="loading" class="loading">Loading…</div>
        <div v-else>
            <div v-if="!hits || hits.length === 0" class="empty">No results</div>
            <div v-else>
                <div v-for="(hit, idx) in hits" :key="idx" class="result-item">
                    <slot name="item" :hit="hit">
                        <pre>{{ hit }}</pre>
                    </slot>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    const props = defineProps({
        hits: {
            type: (Array as any) as () => Array<any>,
            default: () => []
        },
        loading: {
            type: Boolean,
            default: false
        }
    })
</script>

<style scoped>
    .result-list {
        display: block
    }

    .result-item {
        padding: 12px;
        border-bottom: 1px solid #eee
    }

    .loading {
        padding: 12px
    }

    .empty {
        padding: 12px;
        color: #666
    }
</style>
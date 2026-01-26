<template>
    <div>
        <div class="text-center">
            <postCard :post="discussion" />
        </div>
    </div>
</template>

<script setup>
    defineProps({
        discussion: {
            type: Object,
            required: true,
        },
    })
</script>
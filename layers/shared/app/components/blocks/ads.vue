<template>
    <div>
        <Adsbygoogle />
    </div>
</template>

<script setup lang="ts">
    const props = withDefaults(defineProps < {
        enabled ? : boolean;
    } > (), {
        enabled: true,
    })
</script>
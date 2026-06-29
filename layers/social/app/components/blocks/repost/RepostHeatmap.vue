<template>
    <v-card class="pa-4">
        <v-card-title>Repost Heatmap</v-card-title>

        <v-card-text>
            <v-row>
                <v-col v-for="slot in props.slots" :key="slot.label" cols="3" class="text-center">
                    <div class="heat-cell" :style="{ backgroundColor: colorFor(slot.value) }"></div>
                    <div class="label">{{ slot.label }}</div>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
    interface HeatSlot {
        label: string
        value: number
    }

    const props = defineProps < {
        slots: HeatSlot[]
    } > ()

    function colorFor(value: number) {
        if (value === 0) return '#263238'
        if (value < 3) return '#37474F'
        if (value < 7) return '#00ba7c55'
        return '#00ba7c'
    }
</script>

<style scoped>
    .heat-cell {
        width: 40px;
        height: 40px;
        border-radius: 6px;
        margin: 0 auto 4px;
    }

    .label {
        font-size: 12px;
        opacity: 0.8;
    }
</style>
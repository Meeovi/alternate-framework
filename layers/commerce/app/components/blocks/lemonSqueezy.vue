<template>
    <div class="not-prose w-full">
        <div class="flex items-center justify-center p-5">
            <ScriptLemonSqueezy @lemon-squeezy-event="e => events.push(e)" @ready="ready = true">
                <v-btn href="https://harlantest.lemonsqueezy.com/buy/52a40427-36d2-4450-a514-ae80d9e1a333?embed=1"
                    class="block mb-3">
                    Buy me - $9.99
                </v-btn>
                <v-btn href="https://harlantest.lemonsqueezy.com/buy/76bbfa74-a81a-4111-8449-4f5ad564ed76?embed=1"
                    class="block">
                    Buy me - pay what you want
                </v-btn>
            </ScriptLemonSqueezy>
        </div>
        <div>
            <UAlert v-if="!ready" class="mb-5" size="sm" color="blue" variant="soft" title="Lemon Squeezy is not loaded"
                description="It loads in when the DOM element is within the viewport." />
            <UAlert v-else color="green" variant="soft" title="Lemon Squeezy is loaded">
                <template #description>
                    <div class="mb-2">
                        Buttons are live and will open the modal, tracking events:
                    </div>
                    <div v-for="(event, index) in events" :key="index" class="text-xs">
                        {{ event.event }}
                    </div>
                </template>
            </UAlert>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { ref } from 'vue'

    const ready = ref(false)
    const events = ref([])
</script>
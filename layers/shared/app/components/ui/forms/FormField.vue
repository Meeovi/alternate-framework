<script setup lang="ts">
import { computed } from 'vue'

type FormFieldConfig = {
    key: string
    widget?: string
    options?: Record<string, unknown>
    fields?: Array<{ field: string; schema?: { default_value?: unknown } }>
}

const props = defineProps<{
    field: FormFieldConfig
    form: Record<string, unknown>
}>()

const componentName = computed(() => {
    switch (props.field.widget) {
        case 'SelectInput':
            return 'SelectInput'
        case 'RepeaterInput':
            return 'RepeaterInput'
        case 'FileInput':
            return 'FileInput'
        case 'TextInput':
        default:
            return 'TextInput'
    }
})
</script>

<template>
    <div>
        <component
            :is="componentName"
            v-model="form[field.key]"
            :field="field.key"
            :label="field.key"
            :options="field.options"
        />
    </div>
</template>
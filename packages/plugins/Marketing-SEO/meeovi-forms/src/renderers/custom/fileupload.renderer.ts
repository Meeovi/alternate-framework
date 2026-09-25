import {
  computed,
  defineComponent,
  h,
} from 'vue'
import { VFileInput } from 'vuetify/components'
import {
  formatIs,
  rankWith,
  type ControlElement,
  type JsonFormsRendererRegistryEntry,
} from '@jsonforms/core'
import {
  rendererProps,
  useJsonFormsControl,
} from '@jsonforms/vue'

const toFileInputValue = (value: unknown) => Array.isArray(value) ? value[0] ?? null : value

export const fileUploadRenderer: JsonFormsRendererRegistryEntry = {
  tester: rankWith(3, formatIs('file')),
  renderer: defineComponent({
    name: 'FileUploadJsonFormsRenderer',
    props: rendererProps<ControlElement>(),
    setup(props) {
      const { control, handleChange } = useJsonFormsControl(props)
      const disabled = computed(() => !control.value.enabled || control.value.readonly)
      const onUpdate = (value: File | File[] | null) => {
        handleChange(control.value.path, toFileInputValue(value))
      }

      return {
        control,
        disabled,
        onUpdate,
      }
    },
    render() {
      return h(VFileInput, {
        modelValue: toFileInputValue(this.control?.data),
        label: this.control?.label,
        variant: 'outlined',
        density: 'comfortable',
        hideDetails: !this.control?.errors,
        errorMessages: this.control?.errors || undefined,
        disabled: this.disabled,
        clearable: true,
        'onUpdate:modelValue': this.onUpdate,
      })
    },
  }),
}

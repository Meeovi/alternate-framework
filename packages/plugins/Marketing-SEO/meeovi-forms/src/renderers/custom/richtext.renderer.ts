import {
  computed,
  defineComponent,
  h,
} from 'vue'
import { VTextarea } from 'vuetify/components'
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

export const richtextRenderer: JsonFormsRendererRegistryEntry = {
  tester: rankWith(3, formatIs('richtext')),
  renderer: defineComponent({
    name: 'RichtextJsonFormsRenderer',
    props: rendererProps<ControlElement>(),
    setup(props) {
      const { control, handleChange } = useJsonFormsControl(props)
      const disabled = computed(() => !control.value.enabled || control.value.readonly)
      const onUpdate = (value: string) => {
        handleChange(control.value.path, value)
      }

      return {
        control,
        disabled,
        onUpdate,
      }
    },
    render() {
      return h(VTextarea, {
        modelValue: this.control?.data ?? '',
        label: this.control?.label,
        variant: 'outlined',
        density: 'comfortable',
        hideDetails: !this.control?.errors,
        errorMessages: this.control?.errors || undefined,
        disabled: this.disabled,
        rows: 6,
        autoGrow: true,
        'onUpdate:modelValue': this.onUpdate,
      })
    },
  }),
}

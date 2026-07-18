import {
  computed,
  defineComponent,
  h,
} from 'vue'
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

export const repeaterRenderer: JsonFormsRendererRegistryEntry = {
  tester: rankWith(3, formatIs('repeater')),
  renderer: defineComponent({
    name: 'RepeaterJsonFormsRenderer',
    props: rendererProps<ControlElement>(),
    setup(props) {
      const { control, handleChange } = useJsonFormsControl(props)
      const disabled = computed(() => !control.value.enabled || control.value.readonly)
      const items = computed(() => (Array.isArray(control.value.data) ? control.value.data : []) as string[])
      const schema = computed(() => control.value.schema as Record<string, any>)

      const add = () => {
        const next = [...items.value, '']
        handleChange(control.value.path, next)
      }

      const remove = (index: number) => {
        const next = items.value.filter((_: string, i: number) => i !== index)
        handleChange(control.value.path, next)
      }

      const updateItem = (index: number, value: string) => {
        const next = [...items.value]
        next[index] = value
        handleChange(control.value.path, next)
      }

      return {
        control,
        disabled,
        items,
        schema,
        add,
        remove,
        updateItem,
      }
    },
    render() {
      return h('div', { class: 'meeovi-repeater-field' }, [
        this.items.map((item: string, index: number) =>
          h('div', { key: index, class: 'meeovi-repeater-item' }, [
            h('div', { class: 'meeovi-repeater-item-header' }, [
              h('span', { class: 'meeovi-repeater-item-label' }, [
                `${this.control?.label || 'Item'} ${index + 1}`,
              ]),
              h(
                'button',
                {
                  type: 'button',
                  class: 'meeovi-repeater-remove',
                  onClick: () => this.remove(index),
                  disabled: this.disabled,
                },
                ['Remove']
              ),
            ]),
            h('div', { class: 'meeovi-repeater-item-content' }, [
              h('input', {
                value: item,
                type: 'text',
                onInput: (event: Event) =>
                  this.updateItem(index, (event.target as HTMLInputElement).value),
                disabled: this.disabled,
              }),
            ]),
          ])
        ),
        h(
          'button',
          {
            type: 'button',
            class: 'meeovi-repeater-add',
            onClick: this.add,
            disabled: this.disabled,
          },
          [`+ Add ${this.control?.label || 'Item'}`]
        ),
      ])
    },
  }),
}

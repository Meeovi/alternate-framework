export function createVuetifyRendererRegistry() {
  return {
    fields: {
      string: 'TextField',
      number: 'NumberField',
      integer: 'NumberField',
      boolean: 'SelectField',
      date: 'DateField',
      object: 'SectionLayout',
    },
    controls: {
      submit: 'SubmitButton',
      reset: 'ResetButton',
    },
  }
}

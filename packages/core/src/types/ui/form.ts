export type FormFieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'checkbox'
  | 'select'
  | 'textarea'

export interface FormField {
  name: string
  label: string
  type: FormFieldType
  placeholder?: string
  schema?: unknown
  options?: Array<{ label: string; value: string }>
}
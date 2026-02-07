export type FormFields = Record<string, any>

export interface FormValidationResult {
  valid: boolean
  errors?: Record<string, string[]>
}

export default FormFields

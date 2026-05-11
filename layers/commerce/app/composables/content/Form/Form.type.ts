export type FormFields = Record<string, any>

export interface FormValidationResult {
  valid: boolean
  errors?: Record<string, string[]>
}

// Type-only export default is not allowed with verbatimModuleSyntax. Remove default export.
// export default FormFields

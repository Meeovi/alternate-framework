import { computed, ref } from 'vue'
import { validateAgainstSchema, type ValidationResult } from '../utils/validator.js'

export function useFormValidation(schema: Record<string, any>, model: Record<string, any>) {
  const result = ref<ValidationResult>({ valid: true, issues: [] })

  const issuesByPath = computed(() => {
    const byPath: Record<string, string[]> = {}
    for (const issue of result.value.issues) {
      byPath[issue.path] ||= []
      byPath[issue.path].push(issue.message)
    }
    return byPath
  })

  const validate = () => {
    result.value = validateAgainstSchema(schema, model)
    return result.value
  }

  return {
    result,
    issuesByPath,
    validate,
  }
}

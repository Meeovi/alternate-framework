import { computed, ref } from 'vue';
import { validateAgainstSchema } from '../utils/validator.js';
export function useFormValidation(schema, model) {
    const result = ref({ valid: true, issues: [] });
    const issuesByPath = computed(() => {
        const byPath = {};
        for (const issue of result.value.issues) {
            if (!byPath[issue.path]) {
                byPath[issue.path] = [];
            }
            byPath[issue.path].push(issue.message);
        }
        return byPath;
    });
    const validate = () => {
        result.value = validateAgainstSchema(schema, model);
        return result.value;
    };
    return {
        result,
        issuesByPath,
        validate,
    };
}

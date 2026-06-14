import { reactive, ref } from 'vue';
import { mapSchemaDefaults } from '../utils/mapper.js';
import { useFormValidation } from './useFormValidation.js';
export function useJsonForm(options) {
    const base = mapSchemaDefaults(options.schema);
    const model = reactive({ ...base, ...(options.initialValue || {}) });
    const submitting = ref(false);
    const { result, issuesByPath, validate } = useFormValidation(options.schema, model);
    const setValue = (key, value) => {
        ;
        model[key] = value;
    };
    const reset = () => {
        const next = { ...base, ...(options.initialValue || {}) };
        for (const key of Object.keys(model)) {
            delete model[key];
        }
        for (const [key, value] of Object.entries(next)) {
            ;
            model[key] = value;
        }
    };
    const submit = async (onSubmit) => {
        const current = validate();
        if (!current.valid) {
            return current;
        }
        submitting.value = true;
        try {
            if (onSubmit) {
                await onSubmit({ ...model });
            }
            return current;
        }
        finally {
            submitting.value = false;
        }
    };
    return {
        model,
        submitting,
        validation: result,
        issuesByPath,
        setValue,
        reset,
        submit,
        validate,
        uiSchema: options.uiSchema || {},
        schema: options.schema,
    };
}

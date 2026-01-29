export function validateField(field, value) {
    if (!field.validation)
        return null;
    try {
        const validation = field.validation;
        if (validation._and) {
            for (const rule of validation._and) {
                const fieldName = Object.keys(rule)[0];
                if (!fieldName)
                    continue;
                const ruleDef = rule[fieldName];
                if (ruleDef?._regex) {
                    const regex = new RegExp(ruleDef._regex);
                    if (!regex.test(String(value ?? ''))) {
                        return field.validation_message || `${field.field} failed validation`;
                    }
                }
            }
        }
    }
    catch {
        return `Validation error for ${field.field}`;
    }
    return null;
}

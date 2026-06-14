export function validateAgainstSchema(schema, value) {
    const issues = [];
    const required = Array.isArray(schema.required) ? schema.required : [];
    const properties = schema.properties || {};
    for (const key of required) {
        if (value[key] === undefined || value[key] === null || value[key] === '') {
            issues.push({ path: key, message: 'Field is required' });
        }
    }
    for (const [key, propertySchema] of Object.entries(properties)) {
        const current = value[key];
        if (current === undefined || current === null)
            continue;
        if (propertySchema.type === 'number' && Number.isNaN(Number(current))) {
            issues.push({ path: key, message: 'Must be a number' });
        }
        if (propertySchema.type === 'string' && typeof current !== 'string') {
            issues.push({ path: key, message: 'Must be a string' });
        }
    }
    return {
        valid: issues.length === 0,
        issues,
    };
}

export function mapSchemaDefaults(schema) {
    const defaults = {};
    const properties = schema.properties || {};
    for (const [key, propertySchema] of Object.entries(properties)) {
        if (propertySchema.default !== undefined) {
            defaults[key] = propertySchema.default;
            continue;
        }
        if (propertySchema.type === 'string')
            defaults[key] = '';
        if (propertySchema.type === 'number' || propertySchema.type === 'integer')
            defaults[key] = 0;
        if (propertySchema.type === 'boolean')
            defaults[key] = false;
        if (propertySchema.type === 'array')
            defaults[key] = [];
        if (propertySchema.type === 'object')
            defaults[key] = {};
    }
    return defaults;
}

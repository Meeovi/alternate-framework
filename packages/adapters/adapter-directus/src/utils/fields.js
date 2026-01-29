export function mapFieldToWidget(field) {
    if (field.interface)
        return field.interface;
    switch (field.type) {
        case 'string':
        case 'text':
            return 'text';
        case 'integer':
        case 'bigInteger':
        case 'float':
        case 'decimal':
            return 'number';
        case 'boolean':
            return 'checkbox';
        case 'date':
        case 'dateTime':
            return 'date';
        case 'json':
            return 'json';
        default:
            return 'text';
    }
}
export function generateFieldSchema(field) {
    return {
        key: field.field,
        type: field.type,
        widget: mapFieldToWidget(field),
        required: field.required ?? false,
        readonly: field.readonly ?? false,
        hidden: field.hidden ?? false,
        options: field.options ?? {},
        validation: field.validation ?? {},
    };
}
export function generateFieldsSchema(fields) {
    return fields
        .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
        .map(generateFieldSchema);
}

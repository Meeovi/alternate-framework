import { readItems } from "@directus/sdk";
export const widgetRegistry = {
    // Basic inputs
    input: { component: 'TextInput' },
    textarea: { component: 'TextareaInput' },
    boolean: { component: 'ToggleInput' },
    slider: { component: 'SliderInput' },
    color: { component: 'ColorPicker' },
    rating: { component: 'RatingInput' },
    // Selects
    'select-dropdown': { component: 'SelectInput' },
    'select-multiple-dropdown': { component: 'MultiSelectInput' },
    tags: { component: 'TagInput' },
    checkbox: { component: 'CheckboxInput' },
    radio: { component: 'RadioInput' },
    // Date/time
    datetime: { component: 'DateTimeInput' },
    date: { component: 'DateInput' },
    time: { component: 'TimeInput' },
    // Files
    file: { component: 'FileInput', isFile: true },
    files: { component: 'FilesInput', isFile: true },
    image: { component: 'ImageInput', isFile: true },
    images: { component: 'ImagesInput', isFile: true },
    // Complex
    repeater: { component: 'RepeaterInput', isRepeatable: true },
    group: { component: 'GroupInput' },
    json: { component: 'JsonEditor' },
    code: { component: 'CodeEditor' },
    wysiwyg: { component: 'WysiwygEditor' },
    markdown: { component: 'MarkdownEditor' },
    // Directus-specific
    icon: { component: 'IconPicker' },
    user: { component: 'UserSelect' },
    role: { component: 'RoleSelect' },
    translation: { component: 'TranslationInput' },
    // Presentation (ignored in forms)
    presentation: { component: 'PresentationBlock' },
    divider: { component: 'DividerBlock' }
};
export async function extendWidgetRegistryFromDirectus(client) {
    const extensions = await client.request(readItems('directus_extensions'));
    for (const ext of extensions) {
        if (ext.type !== 'interface')
            continue;
        const name = ext.name;
        if (!widgetRegistry[name]) {
            widgetRegistry[name] = {
                component: 'CustomInterfaceRenderer',
                props: { interfaceName: name }
            };
        }
    }
}

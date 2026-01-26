import { defineAsyncComponent, markRaw } from 'vue'
import TextInput from '~/components/blocks/forms/TextInput.vue'
import TextArea from '~/components/blocks/forms/TextArea.vue'
import SelectInput from '~/components/blocks/forms/SelectInput.vue'
import BooleanInput from '~/components/blocks/forms/BooleanInput.vue'
import DateTime from '~/components/blocks/forms/DateTime.vue'
import FileInput from '~/components/blocks/forms/FileInput.vue'

// Registry keyed by Directus schema.type (fallback)
export const fieldRegistry = {
    string: TextInput,
    text: TextArea,
    datetime: DateTime,
    file: FileInput,
    image: FileInput,
    video: FileInput,
    audio: FileInput,
    document: FileInput,
    archive: FileInput,
    enum: SelectInput,
    boolean: BooleanInput
}

// Registry keyed by Directus field.meta.interface (preferred)
export const interfaceRegistry = {
    // basic inputs
    'input': TextInput,
    'input-text': TextInput,
    'input-rich-text': TextArea,
    'input-rich-text-md': TextArea,
    'textarea': TextArea,

    // selects
    'select-dropdown': SelectInput,
    'select-multiple': SelectInput,
    'select-list': SelectInput,

    // boolean / switches
    'boolean': BooleanInput,
    'toggle': BooleanInput,

    // files
    'file': FileInput,
    'file-image': FileInput,
    'file-upload': FileInput,
    'file-input': FileInput,

    // dates
    'datetime': DateTime,
    'date': DateTime,
    'time': DateTime,

    // tags / relational-ish
    'tags': SelectInput,

    // fallback placeholders for other common interfaces (lazy-loaded if custom components are added)
    'gallery': markRaw(defineAsyncComponent(() => import('~/components/blocks/forms/FileInput.vue'))),
    'color': TextInput,
    'rating': TextInput,
    'url': TextInput,
    'email': TextInput,
    'password': TextInput,
    'markdown': TextArea,
}

/**
 * Resolve the component to render for a Directus field.
 * Priority:
 *  1. field.meta.interface -> interfaceRegistry
 *  2. field.type -> fieldRegistry
 *  3. fallback to TextInput
 */
export function resolveFieldComponent(field = {}) {
    // prefer interface from meta
    const iface = field?.meta?.interface
    if (iface && interfaceRegistry[iface]) return interfaceRegistry[iface]

    // some interfaces include variants or capitalization differences, try normalized lookup
    if (iface) {
        const normalized = String(iface).toLowerCase()
        if (interfaceRegistry[normalized]) return interfaceRegistry[normalized]
    }

    // fallback to type mapping
    if (field?.type && fieldRegistry[field.type]) return fieldRegistry[field.type]

    // last-resort: use TextInput
    return TextInput
}
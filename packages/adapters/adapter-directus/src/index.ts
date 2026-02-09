// src/index.ts

export * from './client/createClient';
export { directus } from './client/createClient'

// Vue bindings
export { default as DirectusVueProvider } from './vue/DirectusProvider';
export * from './vue/useDirectus';

// React bindings
export { DirectusProvider as DirectusReactProvider } from './react/DirectusProvider';
export * from './react/useDirectus';

// Schema + generators + utils
export * from './client/createClient';

export * from './schema/types';
export * from './schema/introspect';

export * from './utils/collections';
export * from './utils/fields';

export * from './generators/form-engine';
export * from './generators/table-engine';
export * from './generators/validation-engine';
export * from './generators/widget-registry';

export * from './utils/visualEditing';
export * from './utils/livePreview';
export * from './composables';

export { 
    readItem,
    readItems,
    createItem,
    updateItem,
    deleteItem,
    uploadFiles,
    readSingleton,
    readFieldsByCollection
 } from '@directus/sdk';
import {
  defineNuxtModule,
  addPlugin,
  addComponentsDir,
  addImportsDir
} from '@nuxt/kit';
import { join } from 'path';

export interface ModuleOptions {
  url: string;
  enableVisualEditing?: boolean;
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@meeovi/nuxt-directus',
    configKey: 'directus'
  },

  defaults: {
    url: '',
    enableVisualEditing: false
  },

  setup(options, nuxt) {
    // Expose runtime config
    nuxt.options.runtimeConfig.public.directus = {
      url: options.url,
      enableVisualEditing: options.enableVisualEditing
    };

    // Register plugin
    addPlugin({
      src: resolveRuntime('plugin'),
      mode: 'all'
    });

    // Auto-import composables
    addImportsDir(resolveRuntime('composables'));

    // Auto-register components
    addComponentsDir({
      path: resolveRuntime('components'),
      pathPrefix: false
    });
  }
});

function resolveRuntime(subpath: string) {
  return join(__dirname, 'runtime', subpath);
}

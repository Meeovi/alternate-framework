declare module 'prop-types' {
  const PropTypes: any;
  export default PropTypes;
}

declare module 'Component/*' {
  const whatever: any;
  export = whatever;
}

declare module 'Component/*/*' {
  const whatever: any;
  export = whatever;
}

declare module 'Component/*/*/*' {
  const whatever: any;
  export = whatever;
}

declare const useRuntimeConfig: () => any;
declare const useNuxtApp: () => any;

declare module '~/*' {
  const whatever: any;
  export = whatever;
}

// Fallback for any other unknown imports
declare module '*';

// Nuxt i18n helper (auto-imported at runtime)
declare function defineI18nConfig<T>(fn: () => T): T;

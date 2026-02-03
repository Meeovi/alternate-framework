// Shared form schema types used across the project
export interface FormField {
  id?: string;
  field: string;
  name?: string;
  label?: string;
  placeholder?: string;
  help?: string;
  type?: string; // e.g. 'text', 'integer', 'textarea', 'select', 'checkbox', etc.
  interface?: string; // optional Directus interface name
  required?: boolean;
  width?: string | number;
  choices?: Array<any>;
  options?: Record<string, any> | Array<any>;
  meta?: Record<string, any>;
  [key: string]: any;
}

// Provide an ambient module so imports using the `~/types/schema` alias resolve
declare module '~/types/schema' {
  export interface FormField {
    id?: string;
    field: string;
    name?: string;
    label?: string;
    placeholder?: string;
    help?: string;
    type?: string; // e.g. 'text', 'integer', 'textarea', 'select', 'checkbox', etc.
    interface?: string; // optional Directus interface name
    required?: boolean;
    width?: string | number;
    choices?: Array<any>;
    options?: Record<string, any> | Array<any>;
    meta?: Record<string, any>;
    [key: string]: any;
  }
}

export {};

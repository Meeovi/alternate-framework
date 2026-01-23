import type { DirectusField } from '../schema/types';
import { widgetRegistry } from './widget-registry';

export interface FormEngineOptions {
  clearOnSuccess?: boolean;
  onSuccess?: () => void;
  onError?: (msg: string) => void;
}

export interface GeneratedFormField {
  key: string;
  widget: string;
  type: string;
  options?: Record<string, any>;
  fields?: GeneratedFormField[];
  isRepeatable?: boolean;
  isFile?: boolean;
  isRelational?: boolean;
}

/**
 * Convert a Directus field into a UI-ready form field schema.
 */
export function generateFormField(field: DirectusField): GeneratedFormField {
  const widget = widgetRegistry[field.interface || 'input'];

  const base: GeneratedFormField = {
    key: field.field,
    widget: widget.component,
    type: field.type,
    options: field.options || {},
    isRepeatable: widget.isRepeatable,
    isFile: widget.isFile,
    isRelational: widget.isRelational
  };

  // Repeater or group fields contain nested fields
  if (
    (field.interface === 'repeater' || field.interface === 'group') &&
    Array.isArray(field.options?.fields)
  ) {
    base.fields = field.options.fields.map((sub: any) =>
      generateFormField(sub)
    );
  }

  return base;
}

/**
 * Convert an entire collection's fields into a form schema.
 */
export function generateFormSchema(fields: DirectusField[]): GeneratedFormField[] {
  return fields
    .filter(f => f.interface !== 'presentation' && f.interface !== 'divider')
    .map(generateFormField);
}

/**
 * Framework-agnostic form engine for submitting Directus items.
 */
export function createFormEngine(
  collectionName: string,
  fields: DirectusField[],
  directusClient: any,
  opts?: FormEngineOptions
) {
  const form: Record<string, any> = {};
  let error: string | null = null;
  let success: string | null = null;

  /**
   * Validate a single field using Directus validation metadata.
   */
  const validateField = (field: DirectusField): string | null => {
    if (!field.validation) return null;

    try {
      const validation = field.validation;

      if (validation._and) {
        for (const rule of validation._and) {
          const fieldName = Object.keys(rule)[0];
          if (!fieldName) continue;

          const ruleDef = (rule as any)[fieldName];

          if (ruleDef?._regex) {
            const regex = new RegExp(ruleDef._regex);
            const value = String(form[field.field] ?? '');

            if (!regex.test(value)) {
              return field.validation_message || `${field.field} failed validation`;
            }
          }
        }
      }
    } catch {
      return `Validation error for ${field.field}`;
    }

    return null;
  };

  /**
   * Validate all fields before submission.
   */
  const validate = () => {
    error = null;

    for (const field of fields) {
      const result = validateField(field);
      if (result) {
        error = result;
        opts?.onError?.(result);
        return false;
      }
    }

    return true;
  };

  /**
   * Submit the form to Directus.
   */
  const submit = async () => {
    if (!validate()) return { error, success };

    const result = await directusClient.request(
      directusClient.createItem(collectionName, form)
    );

    if (result?.error) {
      error = result.error.message;
      opts?.onError?.(error as any);
      return { error, success };
    }

    success = `${collectionName} created successfully`;

    if (opts?.clearOnSuccess) {
      for (const key of Object.keys(form)) delete form[key];
    }

    opts?.onSuccess?.();

    return { error, success };
  };

  return {
    form,
    submit,
    get error() {
      return error;
    },
    get success() {
      return success;
    }
  };
}

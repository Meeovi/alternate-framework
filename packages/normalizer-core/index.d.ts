export as namespace NormalizerCore;

export type Validator<T> = (value: unknown) => T;

export type FieldDescriptor<T> = {
  validator: Validator<T>
  optional?: boolean
}

export type Schema<T> = {
  [K in keyof T]: Validator<T[K]> | FieldDescriptor<T[K]>
}

export function createNormalizer<TInput, TOutput>(fn: (input: TInput) => TOutput): (input: TInput) => TOutput;

export class ValidationError extends Error {
  path: string[]
  code?: string
  constructor(message: string, path?: string[], code?: string);
}

export function validate<T extends object>(schema: Schema<T>, input: unknown): T;

export const validators: {
  string: (v: unknown) => string;
  number: (v: unknown) => number;
  boolean: (v: unknown) => boolean;
  dateString: (v: unknown) => string;
  json: (v: unknown) => unknown;
  array: <U>(itemValidator: Validator<U>) => (v: unknown) => U[];
}

export const optional: <T>(validator: Validator<T>) => FieldDescriptor<T | undefined>;

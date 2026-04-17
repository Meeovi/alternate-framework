import type { UseHandleError, ErrorParams } from './types';
import { createError } from 'h3';

const defaultError: ErrorParams = {
  status: 500,
  message: 'An error occurred',
  statusMessage: 'An error occurred',
};

/**
 * @description Composable for handling errors.
 * @param error {@link ErrorParams}
 * @returns Throws an error if there is one.
 * @example
 * const { data, error } = await fetch(data);
 * useHandleError(error.value);
 */
export const useHandleError: UseHandleError = (error) => {
  if (error && typeof error === 'object') {
    const normalizedError = error as Partial<ErrorParams> & {
      statusCode?: number;
    };

    throw createError({
      statusCode: normalizedError.status ?? normalizedError.statusCode ?? defaultError.status,
      message: normalizedError.message ?? defaultError.message,
      statusMessage: normalizedError.message ?? normalizedError.statusMessage ?? defaultError.statusMessage,
      fatal: true,
    });
  }
};

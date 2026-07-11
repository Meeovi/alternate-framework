import type { UseHandleError, ErrorParams } from './types';

const defaultError: ErrorParams = {
  status: 500,
  message: 'An error occurred',
  statusMessage: 'An error occurred',
};

export const useHandleError: UseHandleError = (error) => {
  if (error && typeof error === 'object') {
    const normalizedError = error as Partial<ErrorParams> & {
      statusCode?: number;
    };

    const err = new Error(
      normalizedError.message ?? normalizedError.statusMessage ?? defaultError.message
    )
    ;(err as any).statusCode = normalizedError.status ?? normalizedError.statusCode ?? defaultError.status
    ;(err as any).statusMessage = normalizedError.message ?? normalizedError.statusMessage ?? defaultError.statusMessage
    ;(err as any).fatal = true

    throw err
  }
};
